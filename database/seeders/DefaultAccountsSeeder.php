<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class DefaultAccountsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Seeder gutted as per user request to remove all auto-generated placeholder accounts.
        // The database should only contain real accounts.
        echo "Seeder cleaned. No placeholder accounts created.\n";
    }
}
