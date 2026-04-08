<?php

use Illuminate\Support\Facades\Route;

// Redirect root to login
Route::get('/', function () {
    return redirect('/login');
});

// SPA catch-all routes — all serve the same React app blade
$spaRoutes = [
    'login', 'adminlogin', 'admin',
    'student-register', 'faculty-register',
    // Legacy dashboard paths (keep for backward compat)
    'dashboard', 'faculty', 'students', 'subjects',
    'reports', 'settings', 'archive', 'profile',
    'faculty-dashboard', 'faculty-students', 'faculty-subjects', 'faculty-profile',
    'student-dashboard', 'student-subjects', 'student-profile',
    'forgot-password', 'reset-password',
    // New role-prefixed dashboard paths
    'admin/dashboard', 'admin/profile', 'admin/settings',
    'faculty/dashboard', 'faculty/subjects', 'faculty/students', 'faculty/profile',
    'student/dashboard', 'student/subjects', 'student/grades', 'student/profile',
];

foreach ($spaRoutes as $route) {
    Route::get('/' . $route, function () {
        return view('app');
    });
}
