<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    public function index()
    {
        return Subject::with(['course', 'faculty', 'room'])
            ->orderBy('id', 'desc')
            ->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code'          => 'required|string|max:20|unique:subjects,code',
            'name'          => 'required|string|max:150',
            'department'    => 'nullable|string|max:100',
            'course_id'     => 'nullable|exists:courses,id',
            'faculty_id'    => 'nullable|exists:faculties,id',
            'room_id'       => 'nullable|exists:rooms,id',
            'room'          => 'nullable|string|max:100',
            'year_level'    => 'nullable|string|max:50',
            'schedule_day'  => 'nullable|string|max:50',
            'schedule_time' => 'nullable|string|max:50',
            'time_start'    => 'nullable|string|max:20',
            'time_end'      => 'nullable|string|max:20',
            'semester'      => 'nullable|string|max:20',
            'academic_year' => 'nullable|string|max:20',
            'status'        => 'nullable|string|max:20',
            'section'       => 'nullable|string|max:50',
        ]);

        if (!isset($validated['status'])) {
            $validated['status'] = 'Active';
        }

        $subject = Subject::create($validated);

        return response()->json([
            'message' => 'Subject created successfully!',
            'subject' => $subject->load(['course', 'faculty', 'room']),
        ], 201);
    }

    public function show(Request $request, Subject $subject)
    {
        $facultyId = $request->query('faculty_id');

        // Resolve faculty record robustly
        $faculty = null;
        if ($facultyId) {
            $faculty = \App\Models\Faculty::find($facultyId) 
                    ?? \App\Models\Faculty::where('user_id', $facultyId)->first();
        }
        
        $resolvedFacultyId = $faculty ? $faculty->id : null;

        // Load basic subject relationships
        $subject->load(['course', 'faculty', 'room']);

        // Fetch students manually to ensure exact join structure as the dashboard
        $query = \DB::table('student_subject')
            ->join('students', 'student_subject.student_id', '=', 'students.id')
            ->where('student_subject.subject_id', $subject->id)
            ->where('students.status', 'Active');
        
        if ($resolvedFacultyId) {
            $query->where('student_subject.faculty_id', $resolvedFacultyId);
        }

        $enrolledStudents = $query->select('students.*')->get();
        
        $subject->students = $enrolledStudents;

        // Add formatted fields for frontend
        $timeStartFormatted = $subject->time_start ? date("h:i A", strtotime($subject->time_start)) : null;
        $timeEndFormatted = $subject->time_end ? date("h:i A", strtotime($subject->time_end)) : null;
        $subject->time_display = ($timeStartFormatted && $timeEndFormatted) ? $timeStartFormatted . ' - ' . $timeEndFormatted : 'TBA';
        $subject->room_display = $subject->room_id && $subject->room ? ($subject->room->name . ($subject->room->building ? ' (' . $subject->room->building . ')' : '')) : ($subject->getAttributes()['room'] ?? 'TBA');
        
        return response()->json($subject);
    }

    public function update(Request $request, Subject $subject)
    {
        $validated = $request->validate([
            'code'          => 'required|string|max:20|unique:subjects,code,' . $subject->id,
            'name'          => 'required|string|max:150',
            'department'    => 'nullable|string|max:100',
            'course_id'     => 'nullable|exists:courses,id',
            'faculty_id'    => 'nullable|exists:faculties,id',
            'room_id'       => 'nullable|exists:rooms,id',
            'room'          => 'nullable|string|max:100',
            'year_level'    => 'nullable|string|max:50',
            'schedule_day'  => 'nullable|string|max:50',
            'schedule_time' => 'nullable|string|max:50',
            'time_start'    => 'nullable|string|max:20',
            'time_end'      => 'nullable|string|max:20',
            'semester'      => 'nullable|string|max:20',
            'academic_year' => 'nullable|string|max:20',
            'status'        => 'nullable|string|max:20',
            'section'       => 'nullable|string|max:50',
        ]);

        $subject->update($validated);

        return response()->json([
            'message' => 'Subject updated successfully!',
            'subject' => $subject->load(['course', 'faculty', 'room']),
        ]);
    }

    public function destroy(Subject $subject)
    {
        $subject->delete();
        return response()->json(['message' => 'Subject deleted permanently']);
    }

    public function archive(Subject $subject)
    {
        $subject->update(['status' => 'Archived']);
        return response()->json(['message' => 'Subject archived successfully', 'subject' => $subject]);
    }

    public function restore(Subject $subject)
    {
        $subject->update(['status' => 'Active']);
        return response()->json(['message' => 'Subject restored successfully', 'subject' => $subject]);
    }

    /**
     * Get subjects assigned to a specific faculty
     */
    public function facultySubjects($id)
    {
        // Try to find by faculty profile ID first
        $faculty = \App\Models\Faculty::find($id);
        
        // If not found, try to find by user ID
        if (!$faculty) {
            $faculty = \App\Models\Faculty::where('user_id', $id)->first();
        }

        if (!$faculty) {
            return response()->json([]);
        }

        $subjects = Subject::with(['course', 'room'])
            ->where('faculty_id', $faculty->id)
            ->where('status', 'Active')
            ->get()
            ->map(function($subject) use ($faculty) {
                $timeStartFormatted = $subject->time_start ? date("h:i A", strtotime($subject->time_start)) : null;
                $timeEndFormatted = $subject->time_end ? date("h:i A", strtotime($subject->time_end)) : null;

                return [
                    'id'             => $subject->id,
                    'code'           => $subject->code,
                    'name'           => $subject->name,
                    'units'          => $subject->units,
                    'section'        => $subject->section,
                    'schedule_day'   => $subject->schedule_day,
                    'time_start'     => $subject->time_start,
                    'time_end'       => $subject->time_end,
                    'time_display'   => ($timeStartFormatted && $timeEndFormatted) ? $timeStartFormatted . ' - ' . $timeEndFormatted : 'TBA',
                    'room'           => $subject->room_id && $subject->room ? ($subject->room->name . ($subject->room->building ? ' (' . $subject->room->building . ')' : '')) : ($subject->getAttributes()['room'] ?? 'TBA'),
                    'enrolled_count' => \DB::table('student_subject')->where('subject_id', $subject->id)->where('faculty_id', $faculty->id)->count(),
                    'semester'       => $subject->semester,
                    'academic_year'  => $subject->academic_year,
                ];
            });

        return response()->json($subjects);
    }

    /**
     * Get subjects enrolled by a specific student, with faculty resolved from pivot.
     */
    public function studentSubjects($studentId)
    {
        $subjects = Subject::with(['room', 'course', 'faculty'])
            ->whereHas('students', function ($q) use ($studentId) {
                $q->where('students.id', $studentId);
            })
            ->where('status', 'Active')
            ->get();

        // For each subject, resolve faculty from the pivot if it was set there
        $subjects->each(function ($subject) use ($studentId) {
            $pivotRow = \DB::table('student_subject')
                ->where('subject_id', $subject->id)
                ->where('student_id', $studentId)
                ->first();

            if ($pivotRow && $pivotRow->faculty_id) {
                $subject->faculty = \App\Models\Faculty::find($pivotRow->faculty_id);
            }

            // Expose room as a flat string for the frontend
            if ($subject->room_id && $subject->room) {
                $subject->room = $subject->room->name . ($subject->room->building ? ' (' . $subject->room->building . ')' : '');
            }
        });

        return response()->json($subjects);
    }

    /**
     * Enroll a student in a subject
     */
    public function enrollStudent(Request $request, Subject $subject)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'faculty_id' => 'nullable|exists:faculties,id'
        ]);

        $facultyId = $request->faculty_id ?? $subject->faculty_id;

        if ($facultyId) {
            // Check capacity: 50 students per faculty across all subjects
            $totalStudents = \DB::table('student_subject')
                ->where('faculty_id', $facultyId)
                ->count();
            
            if ($totalStudents >= 50) {
                return response()->json([
                    'message' => 'This faculty member has reached the maximum limit of 50 students and cannot be assigned additional students at this time.'
                ], 422);
            }
        }

        $subject->students()->syncWithoutDetaching([
            $request->student_id => ['faculty_id' => $facultyId]
        ]);

        return response()->json(['message' => 'Student enrolled successfully']);
    }

    /**
     * Unenroll a student from a subject
     */
    public function unenrollStudent(Request $request, Subject $subject)
    {
        $request->validate(['student_id' => 'required|exists:students,id']);
        $subject->students()->detach($request->student_id);
        return response()->json(['message' => 'Student unenrolled successfully']);
    }
}
