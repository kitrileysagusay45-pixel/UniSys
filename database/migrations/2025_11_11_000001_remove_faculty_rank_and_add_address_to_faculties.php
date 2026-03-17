<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class RemoveFacultyRankAndAddAddressToFaculties extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('faculties', function (Blueprint $table) {
            // Remove faculty_rank column if it exists
            if (Schema::hasColumn('faculties', 'faculty_rank')) {
                $table->dropColumn('faculty_rank');
            }
            
            // Add address column if it doesn't exist
            if (!Schema::hasColumn('faculties', 'address')) {
                $table->string('address')->nullable()->after('phone');
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('faculties', function (Blueprint $table) {
            // Add back faculty_rank column
            if (!Schema::hasColumn('faculties', 'faculty_rank')) {
                $table->string('faculty_rank')->nullable()->after('position');
            }
            
            // Remove address column
            if (Schema::hasColumn('faculties', 'address')) {
                $table->dropColumn('address');
            }
        });
    }
}
