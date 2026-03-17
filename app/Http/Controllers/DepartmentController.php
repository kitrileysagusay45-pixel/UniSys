<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function index()
    {
        return Department::orderBy('id', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:10',
            'name' => 'required|string|max:100',
            'head' => 'required|string|max:100',
            'status' => 'string|max:20',
        ]);

        $validated['status'] = $validated['status'] ?? 'Active';
        $department = Department::create($validated);

        return response()->json([
            'message' => '✅ Department created successfully!',
            'department' => $department
        ], 201);
    }

    public function show(Department $department)
    {
        return response()->json($department);
    }

    public function update(Request $request, Department $department)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:10',
            'name' => 'required|string|max:100',
            'head' => 'required|string|max:100',
            'status' => 'string|max:20',
        ]);

        $department->update($validated);

        return response()->json([
            'message' => '✅ Department updated successfully!',
            'department' => $department
        ]);
    }

    public function destroy(Department $department)
    {
        $department->delete();
        return response()->json(['message' => 'Department deleted permanently']);
    }

    public function archive(Department $department)
    {
        $department->update(['status' => 'Archived']);
        return response()->json(['message' => 'Department archived successfully', 'department' => $department]);
    }

    public function restore(Department $department)
    {
        $department->update(['status' => 'Active']);
        return response()->json(['message' => 'Department restored successfully', 'department' => $department]);
    }
}
