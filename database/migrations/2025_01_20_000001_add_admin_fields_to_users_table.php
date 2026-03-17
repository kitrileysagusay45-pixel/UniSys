<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add username field if it doesn't exist
            if (!Schema::hasColumn('users', 'username')) {
                $table->string('username', 255)->unique()->nullable()->after('name');
            }
            
            // Add phone field if it doesn't exist
            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone', 20)->nullable()->after('email');
            }
            
            // Add address field if it doesn't exist
            if (!Schema::hasColumn('users', 'address')) {
                $table->string('address', 255)->nullable()->after('phone');
            }
            
            // Add tin field if it doesn't exist
            if (!Schema::hasColumn('users', 'tin')) {
                $table->string('tin', 50)->nullable()->after('address');
            }
            
            // Add role field if it doesn't exist
            if (!Schema::hasColumn('users', 'role')) {
                $table->string('role', 50)->default('user')->after('tin');
            }
            
            // Add two_fa_enabled field if it doesn't exist
            if (!Schema::hasColumn('users', 'two_fa_enabled')) {
                $table->boolean('two_fa_enabled')->default(false)->after('role');
            }
            
            // Add two_fa_secret field if it doesn't exist
            if (!Schema::hasColumn('users', 'two_fa_secret')) {
                $table->string('two_fa_secret', 255)->nullable()->after('two_fa_enabled');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'username',
                'phone',
                'address',
                'tin',
                'role',
                'two_fa_enabled',
                'two_fa_secret'
            ]);
        });
    }
};
