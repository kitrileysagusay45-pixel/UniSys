<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use App\Models\Faculty;
use App\Models\Student;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    /**
     * Get the full weekly class schedule for the logged-in student.
     * Returns: course code, title, room, days, times, instructor name.
     */
    public function studentSchedule(Request $request)
    {
        $user = $request->_verified_user ?? $request->user();
        $student = Student::where('user_id', $user->id)->first()
                ?? Student::where('email', $user->email)->first();

        if (!$student) {
            return response()->json(['error' => 'Student record not found'], 404);
        }

        $subjects = Subject::with(['faculty', 'room', 'course'])
            ->whereHas('students', function ($q) use ($student) {
                $q->where('students.id', $student->id);
            })
            ->where('status', 'Active')
            ->orderByRaw("FIELD(schedule_day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')")
            ->orderBy('time_start')
            ->get();

        $schedule = $subjects->map(function ($subject) {
            return [
                'id'           => $subject->id,
                'code'         => $subject->code,
                'name'         => $subject->name,
                'units'        => $subject->units,
                'section'      => $subject->section,
                'room'         => $subject->room ? $subject->room->name . ($subject->room->building ? ' (' . $subject->room->building . ')' : '') : 'TBA',
                'day'          => $subject->schedule_day ?? 'TBA',
                'time_start'   => $subject->time_start,
                'time_end'     => $subject->time_end,
                'time_display' => ($subject->time_start && $subject->time_end) ? $subject->time_start . ' - ' . $subject->time_end : 'TBA',
                'instructor'   => $subject->faculty ? trim($subject->faculty->first_name . ' ' . $subject->faculty->last_name) : 'TBA',
                'semester'     => $subject->semester,
                'academic_year'=> $subject->academic_year,
                'course_type'  => $subject->course ? $subject->course->type : null,
            ];
        });

        return response()->json([
            'student' => [
                'id'         => $student->id,
                'student_id' => $student->student_id,
                'name'       => $student->name ?? ($student->first_name . ' ' . $student->last_name),
                'section'    => $student->section,
                'year_level' => $student->year_level,
                'department' => $student->department,
                'course'     => $student->course,
            ],
            'schedule'    => $schedule,
            'total_units' => $subjects->sum('units'),
        ]);
    }

    /**
     * Get the weekly teaching schedule for the logged-in faculty.
     * Returns: course codes, room assignments, time slots.
     */
    public function facultySchedule(Request $request)
    {
        $user = $request->_verified_user ?? $request->user();
        $faculty = Faculty::where('user_id', $user->id)->first()
                ?? Faculty::where('email', $user->email)->first();

        if (!$faculty) {
            return response()->json(['error' => 'Faculty record not found'], 404);
        }

        $subjects = Subject::with(['room', 'course'])
            ->where('faculty_id', $faculty->id)
            ->where('status', 'Active')
            ->orderByRaw("FIELD(schedule_day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')")
            ->orderBy('time_start')
            ->get();

        $schedule = $subjects->map(function ($subject) {
            return [
                'id'           => $subject->id,
                'code'         => $subject->code,
                'name'         => $subject->name,
                'units'        => $subject->units,
                'section'      => $subject->section,
                'room'         => $subject->room ? $subject->room->name . ($subject->room->building ? ' (' . $subject->room->building . ')' : '') : 'TBA',
                'day'          => $subject->schedule_day ?? 'TBA',
                'time_start'   => $subject->time_start,
                'time_end'     => $subject->time_end,
                'time_display' => ($subject->time_start && $subject->time_end) ? $subject->time_start . ' - ' . $subject->time_end : 'TBA',
                'semester'     => $subject->semester,
                'academic_year'=> $subject->academic_year,
                'enrolled_count' => $subject->students()->count(),
                'course_type'  => $subject->course ? $subject->course->type : null,
            ];
        });

        return response()->json([
            'faculty' => [
                'id'         => $faculty->id,
                'faculty_id' => $faculty->faculty_id,
                'name'       => trim(($faculty->first_name ?? '') . ' ' . ($faculty->last_name ?? '')),
                'department' => $faculty->department,
                'position'   => $faculty->position,
            ],
            'schedule'       => $schedule,
            'total_subjects' => $subjects->count(),
            'total_units'    => $subjects->sum('units'),
        ]);
    }

    /**
     * Check for schedule conflicts (Admin use).
     * Validates room + day + time overlaps before saving.
     */
    public function checkConflicts(Request $request)
    {
        $validated = $request->validate([
            'room_id'      => 'required|exists:rooms,id',
            'schedule_day'  => 'required|string',
            'time_start'   => 'required|string',
            'time_end'     => 'required|string',
            'exclude_id'   => 'nullable|exists:subjects,id',
        ]);

        $conflicts = Subject::findConflicts(
            $validated['room_id'],
            $validated['schedule_day'],
            $validated['time_start'],
            $validated['time_end'],
            $validated['exclude_id'] ?? null
        );

        return response()->json([
            'has_conflicts' => $conflicts->isNotEmpty(),
            'conflicts'     => $conflicts->load(['faculty', 'room']),
        ]);
    }
}
