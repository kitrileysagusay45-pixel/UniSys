<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\FacultyController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\AcademicYearController;
use App\Http\Controllers\DashboardController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| All backend endpoints for your React frontend.
| Includes CRUD, Archive, Restore, and Dashboard Count logic.
|--------------------------------------------------------------------------
*/

// ✅ Admin Authentication
Route::post('admin/register', [AdminAuthController::class, 'register']);
Route::post('admin/login', [AdminAuthController::class, 'login']);

// ✅ User Profile Management
Route::post('user/profile/update', [UserProfileController::class, 'update']);
Route::post('user/profile/change-password', [UserProfileController::class, 'changePassword']);

// ✅ Profiles (optional)
Route::apiResource('profiles', ProfileController::class);

// ✅ Faculties CRUD
Route::apiResource('faculties', FacultyController::class);
Route::patch('faculties/{faculty}/status', [FacultyController::class, 'updateStatus']);
Route::patch('faculties/{faculty}/archive', [FacultyController::class, 'archive']);
Route::patch('faculties/{faculty}/restore', [FacultyController::class, 'restore']);

// ✅ Students CRUD
Route::apiResource('students', StudentController::class);
Route::patch('students/{student}/status', [StudentController::class, 'updateStatus']);
Route::patch('students/{student}/archive', [StudentController::class, 'archive']);
Route::patch('students/{student}/restore', [StudentController::class, 'restore']);

// ✅ Departments CRUD
Route::apiResource('departments', DepartmentController::class);
Route::patch('departments/{department}/archive', [DepartmentController::class, 'archive']);
Route::patch('departments/{department}/restore', [DepartmentController::class, 'restore']);

// ✅ Courses CRUD
Route::apiResource('courses', CourseController::class);
Route::patch('courses/{course}/archive', [CourseController::class, 'archive']);
Route::patch('courses/{course}/restore', [CourseController::class, 'restore']);

// ✅ Academic Years CRUD
Route::apiResource('academic-years', AcademicYearController::class);
Route::patch('academic-years/{academicYear}/archive', [AcademicYearController::class, 'archive']);
Route::patch('academic-years/{academicYear}/restore', [AcademicYearController::class, 'restore']);

// ✅ Dashboard Counters
Route::get('/dashboard-counts', [DashboardController::class, 'counts']);

// ✅ Optional: Quick refresh route (used by React Context)
Route::get('/refresh-counts', [DashboardController::class, 'counts']);