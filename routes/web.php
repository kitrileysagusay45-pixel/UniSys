<?php

use Illuminate\Support\Facades\Route;

// Admin Portal Route - Redirect to adminlogin
Route::get('/', function () {
    return redirect('/adminlogin');
});

Route::get('/admin', function () {
    return view('app'); // Admin portal
});

Route::get('/adminlogin', function () {
    return view('app'); // Admin login page
});

Route::get('/dashboard', function () {
    return view('app'); // React app.blade.php
});

Route::get('/faculty', function () {
    return view('app'); // React app
});

Route::get('/students', function () {
    return view('app'); // React app
});

Route::get('/reports', function () {
    return view('app'); // React app
});

Route::get('/settings', function () {
    return view('app'); // React app
});

Route::get('/profile', function () {
    return view('app'); // React app
});

// Student Portal Route (for future implementation)
Route::get('/student', function () {
    return view('student-app'); // Student portal (separate)
});
