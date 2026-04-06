<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\FacultyController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\AcademicYearController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\SystemController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ── PUBLIC: Authentication (no auth required, throttled against brute force)
Route::middleware('throttle:10,1')->group(function () {
    Route::post('login',           [AuthController::class, 'login']);
    Route::post('admin/login',     [AdminAuthController::class, 'login']);
    Route::post('student/login',   [AuthController::class, 'loginStudent']);
    Route::post('faculty/login',   [AuthController::class, 'loginFaculty']);
});

// ── PUBLIC: Registration (throttled)
Route::middleware('throttle:5,1')->group(function () {
    Route::post('student/register', [AuthController::class, 'registerStudent']);
    Route::post('faculty/register', [AuthController::class, 'registerFaculty']);
});

// ── PUBLIC: Password reset
Route::post('forgot-password',  [PasswordResetController::class, 'sendResetLinkEmail']);
Route::post('reset-password',   [PasswordResetController::class, 'resetPassword']);

// ── PROTECTED: Must be any authenticated user ─────────────────────────────────
Route::middleware('api.user')->group(function () {

    // User profile
    Route::post('user/profile/update',          [UserProfileController::class, 'update']);
    Route::post('user/profile/change-password', [UserProfileController::class, 'changePassword']);

    // Profiles
    Route::apiResource('profiles', ProfileController::class);

    // Dashboard counts (all roles can view)
    Route::get('/dashboard-counts',  [DashboardController::class, 'counts']);
    Route::get('/refresh-counts',    [DashboardController::class, 'counts']);

    // Subjects (faculty & students need read access)
    Route::get('subjects',                           [SubjectController::class, 'index']);
    Route::get('subjects/{subject}',                 [SubjectController::class, 'show']);
    Route::get('faculty/{facultyId}/subjects',       [SubjectController::class, 'facultySubjects']);
    Route::get('student/{studentId}/subjects',       [SubjectController::class, 'studentSubjects']);
});

// ── ADMIN ONLY: Full CRUD access ──────────────────────────────────────────────
Route::middleware('api.user:admin')->group(function () {

    // Admin registration (only existing admins can create new admin accounts)
    Route::post('admin/register', [AdminAuthController::class, 'register']);

    // Faculties CRUD
    Route::apiResource('faculties', FacultyController::class);
    Route::patch('faculties/{faculty}/status',   [FacultyController::class, 'updateStatus']);
    Route::patch('faculties/{faculty}/activate', [FacultyController::class, 'activate']);
    Route::patch('faculties/{faculty}/archive',  [FacultyController::class, 'archive']);
    Route::patch('faculties/{faculty}/restore',  [FacultyController::class, 'restore']);

    // Students CRUD
    Route::apiResource('students', StudentController::class);
    Route::patch('students/{student}/status',   [StudentController::class, 'updateStatus']);
    Route::patch('students/{student}/activate', [StudentController::class, 'activate']);
    Route::patch('students/{student}/archive',  [StudentController::class, 'archive']);
    Route::patch('students/{student}/restore',  [StudentController::class, 'restore']);

    // Departments CRUD
    Route::apiResource('departments', DepartmentController::class);
    Route::patch('departments/{department}/archive', [DepartmentController::class, 'archive']);
    Route::patch('departments/{department}/restore', [DepartmentController::class, 'restore']);

    // Courses CRUD
    Route::apiResource('courses', CourseController::class);
    Route::patch('courses/{course}/archive', [CourseController::class, 'archive']);
    Route::patch('courses/{course}/restore', [CourseController::class, 'restore']);

    // Academic Years CRUD
    Route::apiResource('academic-years', AcademicYearController::class);
    Route::patch('academic-years/{academicYear}/archive', [AcademicYearController::class, 'archive']);
    Route::patch('academic-years/{academicYear}/restore', [AcademicYearController::class, 'restore']);

    // Subjects management (admin can write)
    Route::post('subjects',                          [SubjectController::class, 'store']);
    Route::put('subjects/{subject}',                 [SubjectController::class, 'update']);
    Route::delete('subjects/{subject}',              [SubjectController::class, 'destroy']);
    Route::patch('subjects/{subject}/archive',       [SubjectController::class, 'archive']);
    Route::patch('subjects/{subject}/restore',       [SubjectController::class, 'restore']);
    Route::post('subjects/{subject}/enroll',         [SubjectController::class, 'enrollStudent']);
    Route::post('subjects/{subject}/unenroll',       [SubjectController::class, 'unenrollStudent']);

    // System settings & audit logs
    Route::get('/system/settings',    [SystemController::class, 'getSettings']);
    Route::post('/system/settings',   [SystemController::class, 'updateSetting']);
    Route::get('/system/audit-logs',  [SystemController::class, 'getAuditLogs']);
    Route::post('/system/audit-logs', [SystemController::class, 'storeAuditLog']);
});

// ── ADMIN + FACULTY: Department students list ─────────────────────────────────
Route::middleware('api.user:admin,faculty')->group(function () {
    Route::get('faculty/{facultyId}/students', function ($facultyId) {
        try {
            $faculty = \App\Models\Faculty::findOrFail($facultyId);

            $query = \App\Models\Student::where('status', 'Active');

            if ($faculty->department) {
                $query->where('department', $faculty->department);
            } elseif ($faculty->department_id) {
                $query->whereHas('program', function ($q) use ($faculty) {
                    $q->where('department_id', $faculty->department_id);
                });
            }

            return response()->json($query->orderBy('last_name')->get());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Faculty not found'], 404);
        }
    });
});