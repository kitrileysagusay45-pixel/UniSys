<?php

namespace App\Http\Controllers;

use App\Models\Faculty;
use App\Models\AccountActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class FacultyController extends Controller
{
    // ✅ List all faculties (active + archived)
    public function index()
    {
        return Faculty::orderBy('id', 'desc')->get();
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'middle_name' => 'nullable|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|unique:faculties,email|unique:users,email',
            'department' => 'required|string|exists:departments,name',
            'employment_type' => 'required|string|max:50',
            'position' => 'nullable|string|max:100',
        ]);

        try {
            DB::beginTransaction();

            // 1. Auto-generate Faculty ID: FAC-YYYY-NNNN
            $year = date('Y');
            $lastFaculty = Faculty::withTrashed()->whereYear('created_at', $year)
                ->orderBy('id', 'desc')
                ->first();
            
            if ($lastFaculty && preg_match('/FAC-' . $year . '-(\d+)/', $lastFaculty->faculty_id, $matches)) {
                $lastNumber = intval($matches[1]);
                $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
            } else {
                $newNumber = '0001';
            }
            $facultyId = 'FAC-' . $year . '-' . $newNumber;

            // 2. Default password: faculty + last 4 digits of ID
            $defaultPassword = 'faculty' . $newNumber;

            // 3. Create User record
            $user = User::create([
                'name' => trim($validated['first_name'] . ' ' . $validated['last_name']),
                'username' => $facultyId,
                'email' => $validated['email'],
                'password' => Hash::make($defaultPassword),
                'role' => 'faculty',
            ]);

            // 4. Create Faculty profile
            $facultyData = array_merge($validated, [
                'user_id' => $user->id,
                'faculty_id' => $facultyId,
                'name' => trim($validated['first_name'] . ' ' . ($validated['middle_name'] ? $validated['middle_name'] . ' ' : '') . $validated['last_name']),
                'password' => $user->password,
                'status' => 'Active'
            ]);

            $faculty = Faculty::create($facultyData);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "✅ Faculty created! ID: {$facultyId}, Password: {$defaultPassword}",
                'faculty' => $faculty,
                'credentials' => [
                    'username' => $facultyId,
                    'password' => $defaultPassword
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Creation failed: ' . $e->getMessage()
            ], 500);
        }
    }

    // ✅ Show specific faculty
    public function show(Faculty $faculty)
    {
        return response()->json($faculty);
    }

    // ✅ Update faculty
    public function update(Request $request, Faculty $faculty)
    {
        $validated = $request->validate([
            'faculty_id' => 'nullable|string|max:50',
            'employee_id' => 'nullable|string|max:50',
            'first_name' => 'required|string|max:100',
            'middle_name' => 'nullable|string|max:100',
            'last_name' => 'required|string|max:100',
            'date_of_birth' => 'nullable|date',
            'age' => 'nullable|integer|min:18|max:100',
            'sex' => 'nullable|string|max:10',
            'email' => 'required|email|unique:faculties,email,' . $faculty->id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'department' => 'required|string|max:100',
            'position' => 'nullable|string|max:100',
            'employment_type' => 'required|string|max:50',
            'date_hired' => 'nullable|date',
            'office_phone' => 'nullable|string|max:20',
            'status' => 'nullable|string|max:20',
        ]);

        $faculty->update($validated);

        return response()->json([
            'message' => '✅ Faculty updated successfully!',
            'faculty' => $faculty
        ]);
    }

    // ✅ Delete faculty (permanent)
    public function destroy(Faculty $faculty)
    {
        $faculty->delete();
        return response()->json(['message' => 'Faculty deleted permanently']);
    }

    // ✅ Update faculty status (Active/Inactive/Archived)
    public function updateStatus(Request $request, Faculty $faculty)
    {
        $data = $request->validate([
            'status' => 'required|in:Active,Inactive,Archived',
        ]);

        $faculty->update(['status' => $data['status']]);
        return response()->json(['message' => 'Faculty status updated', 'faculty' => $faculty]);
    }

    // ✅ Activate a faculty (Pending → Active)

    // 🆕 Archive a faculty (soft delete)
    public function archive(Faculty $faculty)
    {
        $faculty->update(['status' => 'Archived']);
        return response()->json(['message' => 'Faculty archived successfully', 'faculty' => $faculty]);
    }

    // 🆕 Restore a faculty
    public function restore(Faculty $faculty)
    {
        $faculty->update(['status' => 'Active']);
        return response()->json(['message' => 'Faculty restored successfully', 'faculty' => $faculty]);
    }
}
