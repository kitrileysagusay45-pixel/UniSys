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
            'units'         => 'nullable|integer|min:1|max:10',
            'department'    => 'nullable|string|max:100',
            'section'       => 'nullable|string|max:20',
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
        if (!isset($validated['units'])) {
            $validated['units'] = 3;
        }

        // Check for schedule conflicts
        if (!empty($validated['room_id']) && !empty($validated['schedule_day']) && !empty($validated['time_start']) && !empty($validated['time_end'])) {
            $conflicts = Subject::findConflicts(
                $validated['room_id'],
                $validated['schedule_day'],
                $validated['time_start'],
                $validated['time_end']
            );
            if ($conflicts->isNotEmpty()) {
                return response()->json([
                    'message'   => 'Schedule conflict detected! Another subject is using this room at the same time.',
                    'conflicts' => $conflicts->load(['faculty', 'room']),
                ], 422);
            }
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
            'units'         => 'nullable|integer|min:1|max:10',
            'department'    => 'nullable|string|max:100',
            'section'       => 'nullable|string|max:20',
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

        // Check for schedule conflicts (excluding self)
        if (!empty($validated['room_id']) && !empty($validated['schedule_day']) && !empty($validated['time_start']) && !empty($validated['time_end'])) {
            $conflicts = Subject::findConflicts(
                $validated['room_id'],
                $validated['schedule_day'],
                $validated['time_start'],
                $validated['time_end'],
                $subject->id
            );
            if ($conflicts->isNotEmpty()) {
                return response()->json([
                    'message'   => 'Schedule conflict detected! Another subject is using this room at the same time.',
                    'conflicts' => $conflicts->load(['faculty', 'room']),
                ], 422);
            }
        }

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
