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
            'schedule_day'  => 'nullable|string|max:50',
            'schedule_time' => 'nullable|string|max:50',
            'time_start'    => 'nullable|string|max:20',
            'time_end'      => 'nullable|string|max:20',
            'semester'      => 'nullable|string|max:20',
            'academic_year' => 'nullable|string|max:20',
            'status'        => 'nullable|string|max:20',
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

    public function show(Subject $subject)
    {
        return response()->json($subject->load(['course', 'faculty', 'room', 'students']));
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
            'schedule_day'  => 'nullable|string|max:50',
            'schedule_time' => 'nullable|string|max:50',
            'time_start'    => 'nullable|string|max:20',
            'time_end'      => 'nullable|string|max:20',
            'semester'      => 'nullable|string|max:20',
            'academic_year' => 'nullable|string|max:20',
            'status'        => 'nullable|string|max:20',
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
    public function facultySubjects($facultyId)
    {
        $subjects = Subject::with(['course', 'room'])
            ->where('faculty_id', $facultyId)
            ->where('status', 'Active')
            ->get();

        return response()->json($subjects);
    }

    /**
     * Get subjects enrolled by a specific student
     */
    public function studentSubjects($studentId)
    {
        $subjects = Subject::with(['faculty', 'room', 'course'])
            ->whereHas('students', function ($q) use ($studentId) {
                $q->where('students.id', $studentId);
            })
            ->where('status', 'Active')
            ->get();

        return response()->json($subjects);
    }

    /**
     * Enroll a student in a subject
     */
    public function enrollStudent(Request $request, Subject $subject)
    {
        $request->validate(['student_id' => 'required|exists:students,id']);
        $subject->students()->syncWithoutDetaching([$request->student_id]);
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
