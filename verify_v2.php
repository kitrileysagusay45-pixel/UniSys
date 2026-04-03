<?php
use App\Models\User;
use App\Models\Faculty;
use App\Models\Student;

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "--- Unified Auth Verification ---\n";

$roles = ['admin', 'faculty', 'student'];
foreach ($roles as $role) {
    $count = User::where('role', $role)->count();
    echo ucfirst($role) . " count: " . $count . "\n";
    
    if ($role === 'faculty') {
        $faculty = Faculty::whereNotNull('user_id')->first();
        echo "Sample Faculty user_id: " . ($faculty ? $faculty->user_id : 'NONE') . "\n";
    }
    if ($role === 'student') {
        $student = Student::whereNotNull('user_id')->first();
        echo "Sample Student user_id: " . ($student ? $student->user_id : 'NONE') . "\n";
    }
}
echo "--- End Verification ---\n";
