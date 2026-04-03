<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Faculty;
use App\Models\Student;
use App\Models\Admin;

class DefaultAccountsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        try {
            $password = Hash::make('Unisys2026');

            // 0. Prerequisites
            echo "Seeding Prerequisites...\n";
            $dept = DB::table('departments')->first();
            if (!$dept) {
                $deptId = DB::table('departments')->insertGetId([
                    'name'       => 'Information Technology',
                    'code'       => 'IT',
                    'head'       => 'System Administrator',
                    'status'     => 'Active',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            } else {
                $deptId = $dept->id;
            }

            $prog = DB::table('programs')->first();
            if (!$prog) {
                $progId = DB::table('programs')->insertGetId([
                    'name' => 'BS Computer Science',
                    'code' => 'BSCS',
                    'department_id' => $deptId,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            } else {
                $progId = $prog->id;
            }

            $year = DB::table('year_levels')->first();
            if (!$year) {
                $yearId = DB::table('year_levels')->insertGetId([
                    'name' => '1st Year',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            } else {
                $yearId = $year->id;
            }

            // 1. Admin
            echo "Seeding Admin...\n";
            DB::table('users')->where('role', 'admin')->where('email', 'like', '%@gmail.com')->delete();
            $adminUser = User::updateOrCreate(
                ['username' => 'admin@unisys.com'],
                [
                    'name' => 'System Admin',
                    'email' => 'admin@unisys.com',
                    'password' => $password,
                    'role' => 'admin',
                    'phone' => '09123456789',
                    'address' => 'University Admin Office',
                ]
            );

            DB::table('admins')->updateOrInsert(
                ['user_id' => $adminUser->id],
                [
                    'admin_id' => 'ADM-2026-0001',
                    'status' => 'Active',
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            );

            // 2. Faculty
            echo "Seeding Faculty...\n";
            $facultyUser = User::updateOrCreate(
                ['username' => 'faculty@unisys.com'],
                [
                    'name' => 'Default Faculty',
                    'email' => 'faculty@unisys.com',
                    'password' => $password,
                    'role' => 'faculty',
                    'phone' => '09123456789',
                    'address' => 'Faculty Dept'
                ]
            );

            // Use updateOrInsert for faculties to be safe
            DB::table('faculties')->updateOrInsert(
                ['email' => 'faculty@unisys.com'],
                [
                    'user_id' => $facultyUser->id,
                    'faculty_id' => 'FAC-2026-0001',
                    'department_id' => $deptId,
                    'school_id' => 'SCH-2026',
                    'employee_id' => 'EMP-2026-0001',
                    'first_name' => 'Default',
                    'last_name' => 'Faculty',
                    'email' => 'faculty@unisys.com',
                    'password' => $password,
                    'date_of_birth' => '1990-01-01',
                    'age' => 35,
                    'sex' => 'Male',
                    'phone' => '09123456789',
                    'address' => 'Faculty Dept',
                    'tin_number' => '123-456-789',
                    'department' => 'IT',
                    'position' => 'Instructor',
                    'status' => 'Active',
                    'updated_at' => now()
                ]
            );

            // 3. Student
            echo "Seeding Student...\n";
            $studentUser = User::updateOrCreate(
                ['username' => 'student@unisys.com'],
                [
                    'name' => 'Default Student',
                    'email' => 'student@unisys.com',
                    'password' => $password,
                    'role' => 'student',
                    'phone' => '09123456789',
                    'address' => 'Student Housing'
                ]
            );

            DB::table('students')->updateOrInsert(
                ['email' => 'student@unisys.com'],
                [
                    'user_id' => $studentUser->id,
                    'program_id' => $progId,
                    'year_level_id' => $yearId,
                    'school_id' => 'SCH-2026',
                    'student_id' => 'STU-2026-0001',
                    'first_name' => 'Default',
                    'last_name' => 'Student',
                    'name' => 'Default Student',
                    'email' => 'student@unisys.com',
                    'password' => $password,
                    'date_of_birth' => '2004-01-01',
                    'age' => 20,
                    'sex' => 'Male',
                    'phone' => '09123456789',
                    'address' => 'Student Housing',
                    'course' => 'BSCS',
                    'year_level' => '1st Year',
                    'section' => 'A',
                    'department' => 'IT',
                    'status' => 'Active',
                    'updated_at' => now()
                ]
            );

            echo "Seeding completed successfully.\n";
        } catch (\Exception $e) {
            file_put_contents('c:\xampp\htdocs\UniSys\seeder_error.log', $e->getMessage());
            echo "ERROR IN SEEDER: " . $e->getMessage() . "\n";
        }
    }
}
