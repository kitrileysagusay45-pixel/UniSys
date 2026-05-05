<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // Protected System Admin Seeder - ALWAYS RUNS
        $this->call(SystemAdminSeeder::class);
        
        // Development Seeders (Fake data) - DISABLED
        // $this->call(DefaultAccountsSeeder::class);
    }
}