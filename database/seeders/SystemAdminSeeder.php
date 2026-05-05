<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class SystemAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $email = 'admin@unisys.com';
        $username = 'admin@unisys.com';

        // Check if user exists
        $user = User::where('email', $email)->orWhere('username', $username)->first();

        if (!$user) {
            echo "Creating System Admin account: $email\n";
            $user = User::create([
                'name' => 'System Administrator',
                'email' => $email,
                'username' => $username,
                'password' => Hash::make('Unisys2026'),
                'role' => 'admin',
                'registration_type' => 'system',
                'phone' => '09123456789',
                'address' => 'University Administration Office',
            ]);
        } else {
            echo "System Admin account already exists. Skipping creation.\n";
        }

        // Ensure Admin profile exists
        $adminProfile = Admin::where('user_id', $user->id)->first();
        if (!$adminProfile) {
            Admin::create([
                'user_id' => $user->id,
                'admin_id' => 'ADM-SYS-2026',
                'status' => 'Active',
            ]);
        }
    }
}
