<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Faculty;
use App\Models\Student;

echo "--- Unified Auth Verification ---\n";

// 1. Check Admin
$admin = User::where('role', 'admin')->first();
echo "Admin: " . ($admin ? "FOUND ({$admin->email})" : "NOT FOUND") . "\n";

// 2. Check Faculty
$facultyUser = User::where('role', 'faculty')->first();
if ($facultyUser) {
    echo "Faculty User: FOUND ({$facultyUser->email})\n";
    $facultyProfile = $facultyUser->faculty;
    echo "Faculty Profile: " . ($facultyProfile ? "FOUND (ID: {$facultyProfile->faculty_id})" : "NOT FOUND") . "\n";
} else {
    echo "Faculty User: NOT FOUND\n";
}

// 3. Check Student
$studentUser = User::where('role', 'student')->first();
if ($studentUser) {
    echo "Student User: FOUND ({$studentUser->email})\n";
    $studentProfile = $studentUser->student;
    echo "Student Profile: " . ($studentProfile ? "FOUND (ID: {$studentProfile->student_id})" : "NOT FOUND") . "\n";
} else {
    echo "Student User: NOT FOUND\n";
}

echo "--- End Verification ---\n";
