<?php

namespace App\Http\Controllers;

use App\Models\Grade;
use App\Models\Student;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GradeController extends Controller
{
    /**
     * Display grades for the logged-in student.
     */
    public function myGrades(Request $request)
    {
        $student = Student::where('email', $request->user()->email)->first();
        if (!$student) {
            return response()->json(['error' => 'Student record not found'], 404);
        }

        $grades = Grade::with(['faculty', 'course'])
            ->where('student_id', $student->id)
            ->orderBy('academic_year', 'desc')
            ->orderBy('semester', 'asc')
            ->get();

        return response()->json($grades);
    }

    /**
     * Store a new grade (Faculty entry).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'subject_id' => 'required|exists:subjects,id',
            'faculty_id' => 'required|exists:faculties,id',
            'grade' => 'required|numeric|min:1.0|max:5.0',
            'remarks' => 'nullable|string',
            'semester' => 'required|string',
            'academic_year' => 'required|string',
        ]);

        // Note: grades table uses course_id but subjects are our main entity now.
        // We might need to ensure consistency.
        $subject = Subject::find($validated['subject_id']);
        
        $gradeData = [
            'student_id' => $validated['student_id'],
            'course_id' => $subject->course_id ?? 0, // Fallback if course_id is empty
            'faculty_id' => $validated['faculty_id'],
            'grade' => $validated['grade'],
            'remarks' => $validated['remarks'],
            'semester' => $validated['semester'],
            'academic_year' => $validated['academic_year'],
        ];

        $grade = Grade::updateOrCreate(
            [
                'student_id' => $validated['student_id'],
                'course_id' => $gradeData['course_id'],
                'semester' => $validated['semester'],
                'academic_year' => $validated['academic_year'],
            ],
            $gradeData
        );

        return response()->json($grade, 201);
    }
}
