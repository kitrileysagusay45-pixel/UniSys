<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function index()
    {
        return Course::orderBy('id', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:20',
            'name' => 'required|string|max:150',
            'department' => 'required|string|max:100',
            'credits' => 'required|integer|min:1',
            'status' => 'string|max:20',
        ]);

        $validated['status'] = $validated['status'] ?? 'Active';
        $course = Course::create($validated);

        return response()->json([
            'message' => '✅ Course created successfully!',
            'course' => $course
        ], 201);
    }

    public function show(Course $course)
    {
        return response()->json($course);
    }

    public function update(Request $request, Course $course)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:20',
            'name' => 'required|string|max:150',
            'department' => 'required|string|max:100',
            'credits' => 'required|integer|min:1',
            'status' => 'string|max:20',
        ]);

        $course->update($validated);

        return response()->json([
            'message' => '✅ Course updated successfully!',
            'course' => $course
        ]);
    }

    public function destroy(Course $course)
    {
        $course->delete();
        return response()->json(['message' => 'Course deleted permanently']);
    }

    public function archive(Course $course)
    {
        $course->update(['status' => 'Archived']);
        return response()->json(['message' => 'Course archived successfully', 'course' => $course]);
    }

    public function restore(Course $course)
    {
        $course->update(['status' => 'Active']);
        return response()->json(['message' => 'Course restored successfully', 'course' => $course]);
    }
}
