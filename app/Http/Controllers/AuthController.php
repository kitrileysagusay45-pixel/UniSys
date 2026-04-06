<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Faculty;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    /**
     * Register a new student (public-facing)
     */
    public function registerStudent(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name'   => 'required|string|max:100',
            'middle_name'  => 'nullable|string|max:100',
            'last_name'    => 'required|string|max:100',
            'age'          => 'nullable|integer|min:15|max:100',
            'sex'          => 'required|in:Male,Female',
            'date_of_birth'=> 'required|date',
            'email'        => 'required|email|unique:students,email',
            'phone'        => 'required|string|size:11',
            'address'      => 'required|string|max:500',
            'password'     => 'required|string|min:8|regex:/^(?=.*[A-Z])(?=.*[0-9]).+$/|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Auto-generate Student ID
            $year = date('Y');
            $lastStudent = Student::where('student_id', 'like', "STU-{$year}-%")
                ->orderBy('id', 'desc')
                ->first();

            if ($lastStudent && preg_match('/STU-' . $year . '-(\d+)/', $lastStudent->student_id, $matches)) {
                $newNumber = str_pad(intval($matches[1]) + 1, 4, '0', STR_PAD_LEFT);
            } else {
                $newNumber = '0001';
            }

            $studentId = "STU-{$year}-{$newNumber}";

            // Build full name
            $middleName = !empty($request->middle_name) ? ' ' . $request->middle_name . ' ' : ' ';
            $fullName = trim($request->first_name . $middleName . $request->last_name);

            // 1. Create User account
            $user = User::create([
                'name'     => $fullName,
                'username' => $request->email,
                'email'    => $request->email,
                'password' => Hash::make($request->password),
                'role'     => 'student',
                'phone'    => $request->phone,
                'address'  => $request->address,
            ]);

            // 2. Create Student profile
            $student = Student::create([
                'user_id'       => $user->id,
                'student_id'    => $studentId,
                'name'          => $fullName,
                'first_name'    => $request->first_name,
                'middle_name'   => $request->middle_name,
                'last_name'     => $request->last_name,
                'age'           => $request->age,
                'sex'           => $request->sex,
                'date_of_birth' => $request->date_of_birth,
                'email'         => $request->email,
                'phone'         => $request->phone,
                'address'       => $request->address,
                'password'      => Hash::make($request->password), // Redundant but kept for BC
                'status'        => 'Pending',
                'department'    => '',
                'course'        => '',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Registration successful! Your School ID is: ' . $studentId . '. Please wait for admin activation before you can login.',
                'student_id' => $studentId,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Registration failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Register a new faculty (public-facing)
     */
    public function registerFaculty(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name'   => 'required|string|max:100',
            'middle_name'  => 'nullable|string|max:100',
            'last_name'    => 'required|string|max:100',
            'age'          => 'nullable|integer|min:18|max:100',
            'sex'          => 'required|in:Male,Female',
            'date_of_birth'=> 'required|date',
            'email'        => 'required|email|unique:faculties,email',
            'phone'        => 'required|string|size:11',
            'address'      => 'required|string|max:500',
            'tin_number'   => 'required|string|max:50',
            'password'     => 'required|string|min:8|regex:/^(?=.*[A-Z])(?=.*[0-9]).+$/|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Auto-generate Faculty ID
            $year = date('Y');
            $lastFaculty = Faculty::where('faculty_id', 'like', "FAC-{$year}-%")
                ->orderBy('id', 'desc')
                ->first();

            if ($lastFaculty && preg_match('/FAC-' . $year . '-(\d+)/', $lastFaculty->faculty_id, $matches)) {
                $newNumber = str_pad(intval($matches[1]) + 1, 4, '0', STR_PAD_LEFT);
            } else {
                $newNumber = '0001';
            }

            $facultyId = "FAC-{$year}-{$newNumber}";

            // 1. Create User account
            $user = User::create([
                'name'     => trim($request->first_name . ' ' . $request->last_name),
                'username' => $request->email,
                'email'    => $request->email,
                'password' => Hash::make($request->password),
                'role'     => 'faculty',
                'phone'    => $request->phone,
                'address'  => $request->address,
            ]);

            // 2. Create Faculty profile
            $faculty = Faculty::create([
                'user_id'       => $user->id,
                'faculty_id'    => $facultyId,
                'first_name'    => $request->first_name,
                'middle_name'   => $request->middle_name,
                'last_name'     => $request->last_name,
                'age'           => $request->age,
                'sex'           => $request->sex,
                'date_of_birth' => $request->date_of_birth,
                'email'         => $request->email,
                'phone'         => $request->phone,
                'address'       => $request->address,
                'tin_number'    => $request->tin_number,
                'password'      => Hash::make($request->password), // Redundant but kept for BC
                'status'        => 'Pending',
                'department'    => '',
                'position'      => '',
                'office_phone'  => '',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Registration successful! Your Faculty ID is: ' . $facultyId . '. Please wait for admin activation before you can login.',
                'faculty_id' => $facultyId,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Registration failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Unified login — auto-detects role from credentials
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string',
            'password'   => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $identifier = trim($request->username);
        $password   = $request->password;

        // Find user by email or username
        $user = User::where('email', $identifier)
                    ->orWhere('username', $identifier)
                    ->first();

        if (!$user || !Hash::check($password, $user->password)) {
            return response()->json(['success' => false, 'message' => 'Invalid credentials.'], 401);
        }

        $role = $user->role;

        // ── Admin ──────────────────────────────────────────────────────────
        if ($role === 'admin') {
            $admin = $user->admin;
            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'user'    => array_merge($user->toArray(), ['role' => 'admin', 'admin_profile' => $admin]),
            ]);
        }

        // ── Faculty ────────────────────────────────────────────────────────
        if ($role === 'faculty') {
            $faculty = $user->faculty;
            if (!$faculty) {
                return response()->json(['success' => false, 'message' => 'Faculty profile not found.'], 404);
            }
            if ($faculty->status === 'Pending') {
                return response()->json(['success' => false, 'message' => 'Your account is pending activation. Please contact the admin.'], 403);
            }
            if ($faculty->status === 'Archived') {
                return response()->json(['success' => false, 'message' => 'Your account has been deactivated. Please contact the admin.'], 403);
            }
            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'user'    => [
                    'id'            => $faculty->id,
                    'faculty_id'    => $faculty->faculty_id,
                    'name'          => trim(($faculty->first_name ?? '') . ' ' . ($faculty->last_name ?? '')),
                    'first_name'    => $faculty->first_name,
                    'last_name'     => $faculty->last_name,
                    'email'         => $faculty->email,
                    'phone'         => $faculty->phone,
                    'address'       => $faculty->address,
                    'department'    => $faculty->department ?? '',
                    'position'      => $faculty->position,
                    'sex'           => $faculty->sex,
                    'date_of_birth' => $faculty->date_of_birth,
                    'role'          => 'faculty',
                ],
            ]);
        }

        // ── Student ────────────────────────────────────────────────────────
        if ($role === 'student') {
            $student = $user->student;
            if (!$student) {
                return response()->json(['success' => false, 'message' => 'Student profile not found.'], 404);
            }
            if ($student->status === 'Pending') {
                return response()->json(['success' => false, 'message' => 'Your account is pending activation. Please contact the admin.'], 403);
            }
            if ($student->status === 'Archived') {
                return response()->json(['success' => false, 'message' => 'Your account has been deactivated. Please contact the admin.'], 403);
            }
            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'user'    => [
                    'id'            => $student->id,
                    'student_id'    => $student->student_id,
                    'name'          => $student->name ?? ($student->first_name . ' ' . $student->last_name),
                    'first_name'    => $student->first_name,
                    'last_name'     => $student->last_name,
                    'email'         => $student->email,
                    'phone'         => $student->phone,
                    'address'       => $student->address,
                    'department'    => $student->department,
                    'course'        => $student->course,
                    'section'       => $student->section,
                    'sex'           => $student->sex,
                    'date_of_birth' => $student->date_of_birth,
                    'role'          => 'student',
                ],
            ]);
        }

        return response()->json(['success' => false, 'message' => 'Unrecognized account role.'], 403);
    }

    /**
     * Login student
     */
    public function loginStudent(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|string',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }

        // 1. Authenticate via User table
        $user = User::where('email', $request->email)
                    ->where('role', 'student')
                    ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password'
            ], 401);
        }

        // 2. Fetch associated Student profile
        $student = $user->student;

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student profile not found.'
            ], 404);
        }

        if ($student->status === 'Pending') {
            return response()->json([
                'success' => false,
                'message' => 'Your account is still pending activation. Please contact the admin.'
            ], 403);
        }

        if ($student->status === 'Archived') {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been deactivated. Please contact the admin.'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'user'    => [
                'id'         => $student->id,
                'student_id' => $student->student_id,
                'name'       => $student->name ?? ($student->first_name . ' ' . $student->last_name),
                'first_name' => $student->first_name,
                'last_name'  => $student->last_name,
                'email'      => $student->email,
                'phone'      => $student->phone,
                'address'    => $student->address,
                'department' => $student->department,
                'course'     => $student->course,
                'section'    => $student->section,
                'sex'        => $student->sex,
                'date_of_birth' => $student->date_of_birth,
                'role'       => 'student',
            ],
        ]);
    }

    /**
     * Login faculty
     */
    public function loginFaculty(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|string',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }

        // 1. Authenticate via User table
        $user = User::where('email', $request->email)
                    ->where('role', 'faculty')
                    ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password'
            ], 401);
        }

        // 2. Fetch associated Faculty profile
        $faculty = $user->faculty;

        if (!$faculty) {
            return response()->json([
                'success' => false,
                'message' => 'Faculty profile not found.'
            ], 404);
        }

        if ($faculty->status === 'Pending') {
            return response()->json([
                'success' => false,
                'message' => 'Your account is still pending activation. Please contact the admin.'
            ], 403);
        }

        if ($faculty->status === 'Archived') {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been deactivated. Please contact the admin.'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'user'    => [
                'id'          => $faculty->id,
                'faculty_id'  => $faculty->faculty_id,
                'name'        => trim(($faculty->first_name ?? '') . ' ' . ($faculty->last_name ?? '')),
                'first_name'  => $faculty->first_name,
                'last_name'   => $faculty->last_name,
                'email'       => $faculty->email,
                'phone'       => $faculty->phone,
                'address'     => $faculty->address,
                'department'  => $faculty->department ?? '',
                'position'    => $faculty->position,
                'sex'         => $faculty->sex,
                'date_of_birth' => $faculty->date_of_birth,
                'role'        => 'faculty',
            ],
        ]);
    }
}
