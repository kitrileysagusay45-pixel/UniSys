<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use Illuminate\Http\Request;

class AcademicYearController extends Controller
{
    public function index()
    {
        return AcademicYear::orderBy('id', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'year' => 'required|string|max:20',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'string|max:20',
        ]);

        $validated['status'] = $validated['status'] ?? 'Active';
        $academicYear = AcademicYear::create($validated);

        return response()->json([
            'message' => '✅ Academic Year created successfully!',
            'academicYear' => $academicYear
        ], 201);
    }

    public function show(AcademicYear $academicYear)
    {
        return response()->json($academicYear);
    }

    public function update(Request $request, AcademicYear $academicYear)
    {
        $validated = $request->validate([
            'year' => 'required|string|max:20',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'string|max:20',
        ]);

        $academicYear->update($validated);

        return response()->json([
            'message' => '✅ Academic Year updated successfully!',
            'academicYear' => $academicYear
        ]);
    }

    public function destroy(AcademicYear $academicYear)
    {
        $academicYear->delete();
        return response()->json(['message' => 'Academic Year deleted permanently']);
    }

    public function archive(AcademicYear $academicYear)
    {
        $academicYear->update(['status' => 'Archived']);
        return response()->json(['message' => 'Academic Year archived successfully', 'academicYear' => $academicYear]);
    }

    public function restore(AcademicYear $academicYear)
    {
        $academicYear->update(['status' => 'Active']);
        return response()->json(['message' => 'Academic Year restored successfully', 'academicYear' => $academicYear]);
    }
}
