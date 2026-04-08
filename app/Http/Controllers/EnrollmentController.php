<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EnrollmentController extends Controller
{
    /**
     * Enroll a student in a subject.
     */
    public function enroll(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'subject_id' => 'required|exists:subjects,id',
            'semester' => 'required|string',
            'academic_year' => 'required|string',
        ]);

        $student = Student::find($validated['student_id']);
        
        // Check if already enrolled
        $exists = DB::table('student_subject')
            ->where('student_id', $validated['student_id'])
            ->where('subject_id', $validated['subject_id'])
            ->where('semester', $validated['semester'])
            ->where('academic_year', $validated['academic_year'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Student is already enrolled in this subject for the specified term.'], 422);
        }

        $student->subjects()->attach($validated['subject_id'], [
            'semester' => $validated['semester'],
            'academic_year' => $validated['academic_year'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Student enrolled successfully.']);
    }

    /**
     * Unenroll a student from a subject.
     */
    public function unenroll(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'subject_id' => 'required|exists:subjects,id',
            'semester' => 'required|string',
            'academic_year' => 'required|string',
        ]);

        $student = Student::find($validated['student_id']);
        
        DB::table('student_subject')
            ->where('student_id', $validated['student_id'])
            ->where('subject_id', $validated['subject_id'])
            ->where('semester', $validated['semester'])
            ->where('academic_year', $validated['academic_year'])
            ->delete();

        return response()->json(['message' => 'Student unenrolled successfully.']);
    }
}
