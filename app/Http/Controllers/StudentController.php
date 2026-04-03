<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index()
    {
        return response()->json(Student::all());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'nullable|string|max:100',
            'first_name' => 'required|string|max:100',
            'middle_name' => 'nullable|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|unique:students,email',
            'date_of_birth' => 'nullable|date',
            'age' => 'nullable|integer|min:15|max:100',
            'sex' => 'nullable|in:Male,Female',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'course' => 'required|string|max:100',
            'department' => 'required|string|max:100',
            'year_level' => 'required|string|max:20',
            'status' => 'nullable|string|max:20',
        ]);

        // Handle photo upload
        if ($request->hasFile('photo')) {
            $photo = $request->file('photo');
            $photoName = time() . '_' . $photo->getClientOriginalName();
            $photo->storeAs('public/student_photos', $photoName);
            $data['photo'] = 'storage/student_photos/' . $photoName;
        }

        // Auto-generate Student ID
        $year = date('Y');
        $lastStudent = Student::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();
        
        if ($lastStudent && preg_match('/STU-' . $year . '-(\d+)/', $lastStudent->student_id, $matches)) {
            $lastNumber = intval($matches[1]);
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }
        
        $data['student_id'] = 'STU-' . $year . '-' . $newNumber;
        
        // Combine first, middle and last name for the name field
        $middleName = !empty($data['middle_name']) ? ' ' . $data['middle_name'] . ' ' : ' ';
        $data['name'] = trim($data['first_name'] . $middleName . $data['last_name']);
        
        // Set default status if not provided
        if (!isset($data['status'])) {
            $data['status'] = 'Active';
        }

        $student = Student::create($data);

        return response()->json([
            'message' => '✅ Student added successfully!',
            'student' => $student
        ], 201);
    }

    public function show(Student $student)
    {
        return response()->json($student);
    }

    public function update(Request $request, Student $student)
    {
        $data = $request->validate([
            'student_id' => 'nullable|string|max:50',
            'name' => 'nullable|string|max:100',
            'first_name' => 'required|string|max:100',
            'middle_name' => 'nullable|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|unique:students,email,' . $student->id,
            'date_of_birth' => 'nullable|date',
            'age' => 'nullable|integer|min:15|max:100',
            'sex' => 'nullable|in:Male,Female',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'course' => 'required|string|max:100',
            'department' => 'required|string|max:100',
            'year_level' => 'required|string|max:20',
            'status' => 'nullable|string|max:20',
        ]);

        // Handle photo upload
        if ($request->hasFile('photo')) {
            $photo = $request->file('photo');
            $photoName = time() . '_' . $photo->getClientOriginalName();
            $photo->storeAs('public/student_photos', $photoName);
            $data['photo'] = 'storage/student_photos/' . $photoName;
            
            // Delete old photo if exists
            if ($student->photo && file_exists(public_path($student->photo))) {
                unlink(public_path($student->photo));
            }
        }

        // Update combined name field
        $middleName = !empty($data['middle_name']) ? ' ' . $data['middle_name'] . ' ' : ' ';
        $data['name'] = trim($data['first_name'] . $middleName . $data['last_name']);

        $student->update($data);

        return response()->json([
            'message' => '✅ Student updated successfully!',
            'student' => $student
        ]);
    }

    public function destroy(Student $student)
    {
        $student->delete();
        return response()->json(['message' => '🗑️ Student deleted successfully']);
    }

    public function updateStatus(Request $request, Student $student)
    {
        $data = $request->validate([
            'status' => 'required|in:Active,Inactive,Archived',
        ]);

        $student->update(['status' => $data['status']]);

        return response()->json([
            'message' => 'Status updated successfully',
            'student' => $student
        ]);
    }

    public function activate(Student $student)
    {
        if ($student->status !== 'Pending') {
            return response()->json(['message' => 'Only Pending students can be activated'], 422);
        }

        $student->update(['status' => 'Active']);
        return response()->json(['message' => 'Student activated successfully', 'student' => $student]);
    }

    public function archive(Student $student)
    {
        $student->update(['status' => 'Archived']);
        return response()->json([
            'message' => '📦 Student archived successfully',
            'student' => $student
        ]);
    }

    public function restore(Student $student)
    {
        $student->update(['status' => 'Active']);
        return response()->json([
            'message' => '✅ Student restored successfully',
            'student' => $student
        ]);
    }
}
