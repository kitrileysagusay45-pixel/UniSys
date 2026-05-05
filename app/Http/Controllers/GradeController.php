<?php

namespace App\Http\Controllers;

use App\Models\Grade;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Faculty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GradeController extends Controller
{
    /**
     * Display grades for the logged-in student with all three periods and GWA.
     */
    public function myGrades(Request $request)
    {
        $user = $request->_verified_user ?? $request->user();
        $student = Student::where('user_id', $user->id)->first()
                ?? Student::where('email', $user->email)->first();

        if (!$student) {
            return response()->json(['error' => 'Student record not found'], 404);
        }

        $grades = Grade::with(['faculty', 'course', 'subject'])
            ->where('student_id', $student->id)
            ->orderBy('academic_year', 'desc')
            ->orderBy('semester', 'asc')
            ->get();

        return response()->json([
            'grades' => $grades,
            'gwa'    => $student->getGWA(),
        ]);
    }

    /**
     * Get GWA for the logged-in student, optionally filtered by semester/year.
     */
    public function myGWA(Request $request)
    {
        $user = $request->_verified_user ?? $request->user();
        $student = Student::where('user_id', $user->id)->first()
                ?? Student::where('email', $user->email)->first();

        if (!$student) {
            return response()->json(['error' => 'Student record not found'], 404);
        }

        $semester     = $request->query('semester');
        $academicYear = $request->query('academic_year');

        return response()->json([
            'gwa'           => $student->getGWA($semester, $academicYear),
            'overall_gwa'   => $student->getGWA(),
            'student_id'    => $student->student_id,
            'section'       => $student->section,
            'year_level'    => $student->year_level,
        ]);
    }

    /**
     * Store or update a grade for a specific grading period (Faculty entry).
     * Supports: prelim, midterm, finals
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id'     => 'required|exists:students,id',
            'subject_id'     => 'required|exists:subjects,id',
            'faculty_id'     => 'required|exists:faculties,id',
            'grading_period' => 'required|in:prelim,midterm,finals',
            'grade'          => 'required|numeric|min:1.0|max:5.0',
            'remarks'        => 'nullable|string|in:Passed,Failed,Incomplete,Dropped',
            'semester'       => 'required|string',
            'academic_year'  => 'required|string',
        ]);

        // Verify faculty owns this subject
        $subject = Subject::find($validated['subject_id']);
        if ($subject->faculty_id != $validated['faculty_id']) {
            return response()->json([
                'error' => 'You are not assigned to this subject.'
            ], 403);
        }

        // Find or create the grade record for this student/subject/term
        $grade = Grade::firstOrNew([
            'student_id'    => $validated['student_id'],
            'subject_id'    => $validated['subject_id'],
            'semester'      => $validated['semester'],
            'academic_year' => $validated['academic_year'],
        ]);

        $grade->course_id  = $subject->course_id;
        $grade->faculty_id = $validated['faculty_id'];

        // Update the specific grading period
        $period = $validated['grading_period'];
        $grade->$period = $validated['grade'];
        $grade->grading_period = $period;

        // If remarks is explicitly "Dropped", set it
        if (isset($validated['remarks']) && $validated['remarks'] === 'Dropped') {
            $grade->remarks = 'Dropped';
        } else {
            // Auto-compute final grade and remarks if all periods are filled
            $computed = $grade->computeFinalGrade();
            if ($computed === null) {
                // Not all periods filled yet — set remarks based on current state
                $grade->remarks = $grade->computeRemarks();
            }
        }

        $grade->save();

        // --- Notification Logic ---
        $student = Student::find($validated['student_id']);
        if ($student && $student->user_id) {
            \App\Models\Notification::create([
                'user_id' => $student->user_id,
                'title' => 'Grade Updated',
                'message' => "Your " . ucfirst($period) . " grade for {$subject->name} has been posted/updated.",
                'type' => 'info',
                'icon' => 'book-open',
                'action_link' => '/student-dashboard', // Or /grades if that exists
                'is_read' => false,
            ]);
        }
        // --------------------------

        return response()->json([
            'message' => ucfirst($period) . ' grade saved successfully.',
            'grade'   => $grade->load(['student', 'subject', 'course', 'faculty']),
        ], 201);
    }

    /**
     * Update a specific grading period for a student (Faculty entry).
     */
    public function updatePeriodGrade(Request $request)
    {
        $validated = $request->validate([
            'student_id'     => 'required|exists:students,id',
            'subject_id'     => 'required|exists:subjects,id',
            'faculty_id'     => 'required|exists:faculties,id',
            'grading_period' => 'required|in:prelim,midterm,finals',
            'grade'          => 'required|numeric|min:1.0|max:5.0',
        ]);

        // Verify faculty owns this subject
        $subject = Subject::find($validated['subject_id']);
        if ($subject->faculty_id != $validated['faculty_id']) {
            return response()->json(['error' => 'You are not assigned to this subject.'], 403);
        }

        $grade = Grade::where('student_id', $validated['student_id'])
            ->where('subject_id', $validated['subject_id'])
            ->first();

        if (!$grade) {
            return response()->json(['error' => 'Grade record not found.'], 404);
        }

        $period = $validated['grading_period'];
        $grade->$period = $validated['grade'];
        $grade->computeFinalGrade();
        $grade->save();

        // --- Notification Logic ---
        $student = Student::find($validated['student_id']);
        if ($student && $student->user_id) {
            \App\Models\Notification::create([
                'user_id' => $student->user_id,
                'title' => 'Grade Updated',
                'message' => "Your " . ucfirst($period) . " grade for {$subject->name} has been posted/updated.",
                'type' => 'info',
                'icon' => 'book-open',
                'action_link' => '/student-dashboard', // Or /grades if that exists
                'is_read' => false,
            ]);
        }
        // --------------------------

        return response()->json([
            'message' => ucfirst($period) . ' grade updated successfully.',
            'grade'   => $grade->load(['student', 'subject', 'course', 'faculty']),
        ]);
    }

    /**
     * Get all grades for a specific subject/section — Faculty view.
     * Faculty can only view grades for subjects they are assigned to.
     */
    public function sectionGrades(Request $request, $subjectId)
    {
        $user = $request->_verified_user ?? $request->user();
        $faculty = Faculty::where('user_id', $user->id)->first()
                ?? Faculty::where('email', $user->email)->first();

        if (!$faculty) {
            return response()->json(['error' => 'Faculty record not found'], 404);
        }

        $subject = Subject::with(['students'])->find($subjectId);

        if (!$subject) {
            return response()->json(['error' => 'Subject not found'], 404);
        }

        // Check faculty ownership
        if ($subject->faculty_id != $faculty->id) {
            return response()->json(['error' => 'You are not assigned to this subject.'], 403);
        }

        $grades = Grade::with(['student', 'course'])
            ->where('subject_id', $subjectId)
            ->orderBy('student_id')
            ->get();

        return response()->json([
            'subject'  => $subject,
            'grades'   => $grades,
            'students' => $subject->students,
        ]);
    }
}
