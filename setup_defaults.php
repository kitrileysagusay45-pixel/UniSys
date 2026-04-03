<?php

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Setting up default accounts (Direct DB approach)...\n";

try {
    DB::statement('SET FOREIGN_KEY_CHECKS=0;');

    // 1. Admin
    echo "- Processing Admin...\n";
    DB::table('users')->where('role', 'admin')->where('email', 'like', '%@gmail.com')->delete();

    $adminData = [
        'name' => 'System Admin',
        'email' => 'admin@unisys.com',
        'username' => 'admin@unisys.com',
        'password' => Hash::make('Unisys2026'),
        'role' => 'admin',
        'phone' => '09123456789',
        'address' => 'University Administration Office',
        'updated_at' => now()
    ];

    $exists = DB::table('users')->where('username', 'admin@unisys.com')->exists();
    if ($exists) {
        DB::table('users')->where('username', 'admin@unisys.com')->update($adminData);
    } else {
        $adminData['created_at'] = now();
        DB::table('users')->insert($adminData);
    }

    // 2. Faculty
    echo "- Processing Faculty...\n";
    $facultyData = [
        'first_name' => 'Default',
        'last_name' => 'Faculty',
        'faculty_id' => 'FAC-2026-0001',
        'email' => 'faculty@unisys.com',
        'password' => Hash::make('Unisys2026'),
        'status' => 'Active',
        'phone' => '09123456789',
        'address' => 'Faculty Department',
        'department' => 'Information Technology',
        'tin_number' => '123-456-789',
        'age' => 35,
        'sex' => 'Male',
        'date_of_birth' => '1990-01-01',
        'updated_at' => now()
    ];

    $fExists = DB::table('faculties')->where('email', 'faculty@unisys.com')->exists();
    if ($fExists) {
        DB::table('faculties')->where('email', 'faculty@unisys.com')->update($facultyData);
    } else {
        $facultyData['created_at'] = now();
        DB::table('faculties')->insert($facultyData);
    }

    // 3. Student
    echo "- Processing Student...\n";
    $studentData = [
        'first_name' => 'Default',
        'last_name' => 'Student',
        'student_id' => 'STU-2026-0001',
        'email' => 'student@unisys.com',
        'password' => Hash::make('Unisys2026'),
        'status' => 'Active',
        'phone' => '09123456789',
        'address' => 'Student Housing',
        'course' => 'BSCS',
        'year_level' => '1st Year',
        'section' => 'A',
        'sex' => 'Male',
        'age' => 20,
        'date_of_birth' => '2004-01-01',
        'updated_at' => now()
    ];

    $sExists = DB::table('students')->where('email', 'student@unisys.com')->exists();
    if ($sExists) {
        DB::table('students')->where('email', 'student@unisys.com')->update($studentData);
    } else {
        $studentData['created_at'] = now();
        DB::table('students')->insert($studentData);
    }

    DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    echo "Done! Default accounts ready.\n";
    echo "Admin: admin@unisys.com / Unisys2026\n";
    echo "Faculty: faculty@unisys.com / Unisys2026\n";
    echo "Student: student@unisys.com / Unisys2026\n";

} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
