<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Faculty;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class AuthController extends Controller
{

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
        $ip         = $request->ip();
        $key        = 'login-attempts:' . Str::lower($identifier) . '|' . $ip;

        // 1. Check Rate Limiting
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            return response()->json([
                'success' => false,
                'message' => "Too many login attempts. Please try again in {$seconds} seconds."
            ], 429);
        }

        // 2. Find user
        $user = User::where('email', $identifier)
                    ->orWhere('username', $identifier)
                    ->first();

        if (!$user || !Hash::check($password, $user->password)) {
            RateLimiter::hit($key, 300); // 5 minute decay
            return response()->json(['success' => false, 'message' => 'Invalid credentials.'], 401);
        }

        // Success: Clear Rate Limiter
        RateLimiter::clear($key);

        // Update Last Login
        $user->update(['last_login_at' => now()]);

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
            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'user'    => [
                    'id'            => $user->id, // User ID for auth
                    'faculty_id'    => $faculty->faculty_id,
                    'profile_id'    => $faculty->id, // Profile ID for associations
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
            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'user'    => [
                    'id'            => $user->id, // User ID for auth
                    'student_id'    => $student->student_id,
                    'profile_id'    => $student->id, // Profile ID
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
     * Public username/role lookup — used by the login page to show the role badge.
     * Returns ONLY the role. Never reveals passwords or sensitive data.
     */
    public function lookupUser(Request $request)
    {
        $identifier = trim($request->input('username', ''));

        if (empty($identifier) || strlen($identifier) < 3) {
            return response()->json(['found' => false], 200);
        }

        $user = User::where('email', $identifier)
                    ->orWhere('username', $identifier)
                    ->with(['student', 'faculty'])
                    ->first(['id', 'name', 'role']);

        if (!$user) {
            return response()->json(['found' => false], 200);
        }

        $profile = $user->student ?? $user->faculty;
        $status = $profile->status ?? 'Active';
        return response()->json([
            'found' => true,
            'role'  => $user->role,
            'status' => $status,
            'rejection_reason' => $profile->rejection_reason ?? ''
        ]);
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

    /**
     * Register new student
     */
    public function registerStudent(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string',
            'last_name'  => 'required|string',
            'email'      => 'required|email|unique:users,email',
            'phone'      => 'required|string',
            'address'    => 'required|string',
            'course'     => 'required|string',
            'department' => 'required|string',
            'year_level' => 'required|string',
            'password'   => 'required|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // Generate student_id (starting 26)
        $maxId = Student::where('student_id', 'like', '26%')->max('student_id');
        $studentId = $maxId ? ((int)$maxId + 1) : 26100;

        DB::beginTransaction();
        try {
            $user = User::create([
                'name'     => trim($request->first_name . ' ' . $request->last_name),
                'email'    => $request->email,
                'username' => (string)$studentId,
                'password' => Hash::make($request->password),
                'role'     => 'student'
            ]);

            $student = Student::create([
                'user_id'    => $user->id,
                'student_id' => (string)$studentId,
                'name'       => trim($request->first_name . ' ' . $request->last_name),
                'first_name' => $request->first_name,
                'last_name'  => $request->last_name,
                'email'      => $request->email,
                'phone'      => $request->phone,
                'address'    => $request->address,
                'course'     => $request->course,
                'department' => $request->department,
                'year_level' => $request->year_level,
                'status'     => 'Active'
            ]);

            // Notify admins
            $admins = User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                \App\Models\Notification::create([
                    'user_id' => $admin->id,
                    'title' => 'New Student Registered',
                    'message' => "Student {$request->first_name} {$request->last_name} has just registered.",
                    'type' => 'info',
                    'icon' => 'user',
                    'action_link' => '/students'
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Registration successful',
                'user'    => [
                    'id'         => $user->id,
                    'student_id' => $student->student_id,
                    'name'       => trim($student->first_name . ' ' . $student->last_name),
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
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Registration failed. ' . $e->getMessage()], 500);
        }
    }

    /**
     * Register new faculty
     */
    public function registerFaculty(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name'     => 'required|string',
            'last_name'      => 'required|string',
            'email'          => 'required|email|unique:users,email',
            'phone'          => 'required|string',
            'department'     => 'required|string',
            'password'       => 'required|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // Generate faculty_id (starting 27)
        $maxId = Faculty::where('faculty_id', 'like', '27%')->max('faculty_id');
        $facultyId = $maxId ? ((int)$maxId + 1) : 27100;

        DB::beginTransaction();
        try {
            $user = User::create([
                'name'     => trim($request->first_name . ' ' . $request->last_name),
                'email'    => $request->email,
                'username' => (string)$facultyId,
                'password' => Hash::make($request->password),
                'role'     => 'faculty'
            ]);

            $faculty = Faculty::create([
                'user_id'        => $user->id,
                'faculty_id'     => (string)$facultyId,
                'first_name'     => $request->first_name,
                'last_name'      => $request->last_name,
                'email'          => $request->email,
                'phone'          => $request->phone,
                'department'     => $request->department,
                'position'       => 'Pending Assignment',
                'specialization' => null,
                'status'         => 'Active'
            ]);

            // Notify admins
            $admins = User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                \App\Models\Notification::create([
                    'user_id' => $admin->id,
                    'title' => 'New Faculty Registered',
                    'message' => "Faculty {$request->first_name} {$request->last_name} has just registered.",
                    'type' => 'info',
                    'icon' => 'book-open',
                    'action_link' => '/faculty'
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Registration successful',
                'user'    => [
                    'id'          => $user->id,
                    'faculty_id'  => $faculty->faculty_id,
                    'name'        => trim($faculty->first_name . ' ' . $faculty->last_name),
                    'first_name'  => $faculty->first_name,
                    'last_name'   => $faculty->last_name,
                    'email'       => $faculty->email,
                    'phone'       => $faculty->phone,
                    'address'     => $faculty->address,
                    'department'  => $faculty->department,
                    'position'    => $faculty->position,
                    'sex'         => $faculty->sex,
                    'date_of_birth' => $faculty->date_of_birth,
                    'role'        => 'faculty',
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Registration failed. ' . $e->getMessage()], 500);
        }
    }
}
