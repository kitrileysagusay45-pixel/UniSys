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
     * Register a new student (public-facing)
     */
    public function registerStudent(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'         => 'required|string|max:255',
            'student_id'   => 'required|string|unique:students,student_id',
            'email'        => 'required|email|unique:users,email',
            'course'       => 'required|string|max:100',
            'department'   => 'required|string|max:100',
            'year_level'   => 'required|string|max:20',
            'password'     => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $studentId = $request->student_id;
            $fullName  = $request->name;

            // 1. Create User account
            $user = User::create([
                'name'     => $fullName,
                'username' => $request->email,
                'email'    => $request->email,
                'password' => Hash::make($request->password),
                'role'     => 'student',
            ]);

            // 5. Logic: Student Auto-Approval (YYYY-NNNNN pattern)
            // Pattern: YYYY-NNNNN (e.g. 2024-00123)
            $isAutoApproved = preg_match('/^\d{4}-\d{5}$/', $studentId);
            $initialStatus = $isAutoApproved ? 'Active' : 'Pending';

            // 2. Create Student profile
            $student = Student::create([
                'user_id'       => $user->id,
                'student_id'    => $studentId, // We use the provided ID if it matches pattern or user input
                'name'          => $fullName,
                'email'         => $request->email,
                'course'        => $request->course,
                'department'    => $request->department,
                'year_level'    => $request->year_level,
                'password'      => $user->password,
                'status'        => $initialStatus,
            ]);

            DB::commit();

            if ($isAutoApproved) {
                AccountActivityLog::create([
                    'loggable_id' => $student->id,
                    'loggable_type' => Student::class,
                    'action' => 'Auto-Approved',
                    'reason' => 'ID matched auto-approval pattern (YYYY-NNNNN)',
                ]);
            }

            $successMsg = $isAutoApproved 
                ? 'Registration successful! Your account is auto-approved and active.'
                : 'Registration successful! Please wait for admin activation before you can login.';

            return response()->json([
                'success' => true,
                'message' => $successMsg,
                'student_id' => $studentId,
                'auto_approved' => $isAutoApproved
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
            'name'         => 'required|string|max:255',
            'faculty_id'   => 'required|string|unique:faculties,faculty_id',
            'email'        => 'required|email|unique:users,email',
            'department'   => 'required|string|max:100',
            'position'     => 'required|string|max:100',
            'password'     => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $facultyId = $request->faculty_id;
            $fullName  = $request->name;

            // 1. Create User account
            $user = User::create([
                'name'     => $fullName,
                'username' => $request->email,
                'email'    => $request->email,
                'password' => Hash::make($request->password),
                'role'     => 'faculty',
            ]);

            // 2. Create Faculty profile
            $faculty = Faculty::create([
                'user_id'       => $user->id,
                'faculty_id'    => $facultyId,
                'name'          => $fullName,
                'email'         => $request->email,
                'department'    => $request->department,
                'position'      => $request->position,
                'password'      => $user->password,
                'status'        => 'Pending',
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
            if ($faculty->status === 'Pending') {
                return response()->json(['success' => false, 'message' => 'Your account is pending activation. Please contact the admin.'], 403);
            }
            if ($faculty->status === 'Rejected') {
                $reason = $faculty->rejection_reason ? " Reason: {$faculty->rejection_reason}" : "";
                return response()->json(['success' => false, 'message' => 'Your account registration was rejected.' . $reason], 403);
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
            if ($student->status === 'Rejected') {
                $reason = $student->rejection_reason ? " Reason: {$student->rejection_reason}" : "";
                return response()->json(['success' => false, 'message' => 'Your account registration was rejected.' . $reason], 403);
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

        // Determine status and rejection reason based on role and linked profile
        $status = 'Active'; 
        $rejectionReason = '';
        if ($user->role === 'student') {
            $status = $user->student ? $user->student->status : 'Pending';
            $rejectionReason = $user->student ? $user->student->rejection_reason : '';
        } elseif ($user->role === 'faculty') {
            $status = $user->faculty ? $user->faculty->status : 'Pending';
            $rejectionReason = $user->faculty ? $user->faculty->rejection_reason : '';
        }

        return response()->json([
            'found'  => true,
            'name'   => $user->name,
            'role'   => $user->role,
            'status' => $status,
            'rejection_reason' => $rejectionReason,
        ], 200);
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
