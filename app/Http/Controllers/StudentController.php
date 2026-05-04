<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\AccountActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class StudentController extends Controller
{
    public function index()
    {
        return response()->json(Student::all());
    }


    public function store(Request $request)
    {
        $data = $request->validate([
            'first_name' => 'required|string|max:100',
            'middle_name' => 'nullable|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|unique:students,email|unique:users,email',
            'department' => 'required|string|exists:departments,name',
            'course' => 'required|string|exists:courses,name',
            'year_level' => 'required|string|max:20',
            'section' => 'nullable|string|max:50',
        ]);

        try {
            DB::beginTransaction();

            // 1. Auto-generate Student ID: STU-YYYY-NNNN
            $year = date('Y');
            $lastStudent = Student::withTrashed()->whereYear('created_at', $year)
                ->orderBy('id', 'desc')
                ->first();
            
            if ($lastStudent && preg_match('/STU-' . $year . '-(\d+)/', $lastStudent->student_id, $matches)) {
                $lastNumber = intval($matches[1]);
                $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
            } else {
                $newNumber = '0001';
            }
            $studentId = 'STU-' . $year . '-' . $newNumber;

            // 2. Default password: student + last 4 digits of ID
            $defaultPassword = 'student' . $newNumber;

            // 3. Create User record
            $user = User::create([
                'name' => trim($data['first_name'] . ' ' . $data['last_name']),
                'username' => $studentId,
                'email' => $data['email'],
                'password' => Hash::make($defaultPassword),
                'role' => 'student',
            ]);

            // 4. Create Student profile
            $middleName = !empty($data['middle_name']) ? ' ' . $data['middle_name'] . ' ' : ' ';
            $studentData = array_merge($data, [
                'user_id' => $user->id,
                'student_id' => $studentId,
                'name' => trim($data['first_name'] . $middleName . $data['last_name']),
                'password' => $user->password,
                'status' => 'Active',
                'enrollment_status' => 'enrolled'
            ]);

            $student = Student::create($studentData);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "✅ Student enrolled! ID: {$studentId}, Password: {$defaultPassword}",
                'student' => $student,
                'credentials' => [
                    'username' => $studentId,
                    'password' => $defaultPassword
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Enrollment failed: ' . $e->getMessage()
            ], 500);
        }
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
