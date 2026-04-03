<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
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

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ── Authentication ──────────────────────────────────────────────────────
Route::post('login', [AuthController::class, 'login']);
Route::post('admin/register', [AdminAuthController::class, 'register']);
Route::post('admin/login', [AdminAuthController::class, 'login']);
Route::post('student/register', [AuthController::class, 'registerStudent']);
Route::post('student/login', [AuthController::class, 'loginStudent']);
Route::post('faculty/register', [AuthController::class, 'registerFaculty']);
Route::post('faculty/login', [AuthController::class, 'loginFaculty']);
Route::post('forgot-password', [PasswordResetController::class, 'sendResetLinkEmail']);
Route::post('reset-password', [PasswordResetController::class, 'resetPassword']);

// ── User Profile Management ────────────────────────────────────────────
Route::post('user/profile/update', [UserProfileController::class, 'update']);
Route::post('user/profile/change-password', [UserProfileController::class, 'changePassword']);

// ── Profiles ────────────────────────────────────────────────────────────
Route::apiResource('profiles', ProfileController::class);

// ── Faculties CRUD ──────────────────────────────────────────────────────
Route::apiResource('faculties', FacultyController::class);
Route::patch('faculties/{faculty}/status', [FacultyController::class, 'updateStatus']);
Route::patch('faculties/{faculty}/activate', [FacultyController::class, 'activate']);
Route::patch('faculties/{faculty}/archive', [FacultyController::class, 'archive']);
Route::patch('faculties/{faculty}/restore', [FacultyController::class, 'restore']);

// ── Students CRUD ───────────────────────────────────────────────────────
Route::apiResource('students', StudentController::class);
Route::patch('students/{student}/status', [StudentController::class, 'updateStatus']);
Route::patch('students/{student}/activate', [StudentController::class, 'activate']);
Route::patch('students/{student}/archive', [StudentController::class, 'archive']);
Route::patch('students/{student}/restore', [StudentController::class, 'restore']);

// ── Departments CRUD ────────────────────────────────────────────────────
Route::apiResource('departments', DepartmentController::class);
Route::patch('departments/{department}/archive', [DepartmentController::class, 'archive']);
Route::patch('departments/{department}/restore', [DepartmentController::class, 'restore']);

// ── Courses CRUD ────────────────────────────────────────────────────────
Route::apiResource('courses', CourseController::class);
Route::patch('courses/{course}/archive', [CourseController::class, 'archive']);
Route::patch('courses/{course}/restore', [CourseController::class, 'restore']);

// ── Academic Years CRUD ─────────────────────────────────────────────────
Route::apiResource('academic-years', AcademicYearController::class);
Route::patch('academic-years/{academicYear}/archive', [AcademicYearController::class, 'archive']);
Route::patch('academic-years/{academicYear}/restore', [AcademicYearController::class, 'restore']);

// ── Subjects CRUD ───────────────────────────────────────────────────────
Route::apiResource('subjects', SubjectController::class);
Route::patch('subjects/{subject}/archive', [SubjectController::class, 'archive']);
Route::patch('subjects/{subject}/restore', [SubjectController::class, 'restore']);
Route::post('subjects/{subject}/enroll', [SubjectController::class, 'enrollStudent']);
Route::post('subjects/{subject}/unenroll', [SubjectController::class, 'unenrollStudent']);
Route::get('faculty/{facultyId}/subjects', [SubjectController::class, 'facultySubjects']);
Route::get('student/{studentId}/subjects', [SubjectController::class, 'studentSubjects']);

// ── Faculty-specific: students under their department ───────────────────
Route::get('faculty/{facultyId}/students', function ($facultyId) {
    try {
        $faculty = \App\Models\Faculty::findOrFail($facultyId);
        
        // Try getting by department string first for backwards compatibility
        $query = \App\Models\Student::where('status', 'Active');
        
        if ($faculty->department) {
            $query->where('department', $faculty->department);
        } elseif ($faculty->department_id) {
            // If department string is missing but we have ID, join through programs
            $query->whereHas('program', function($q) use ($faculty) {
                $q->where('department_id', $faculty->department_id);
            });
        }
        
        $students = $query->orderBy('last_name')->get();
        return response()->json($students);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

// ── Dashboard Counters ──────────────────────────────────────────────────
Route::get('/dashboard-counts', [DashboardController::class, 'counts']);
Route::get('/refresh-counts', [DashboardController::class, 'counts']);