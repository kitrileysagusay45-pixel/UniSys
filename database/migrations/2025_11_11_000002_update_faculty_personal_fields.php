<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateFacultyPersonalFields extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('faculties', function (Blueprint $table) {
            // Remove title column if it exists
            if (Schema::hasColumn('faculties', 'title')) {
                $table->dropColumn('title');
            }
            
            // Add middle_name column if it doesn't exist
            if (!Schema::hasColumn('faculties', 'middle_name')) {
                $table->string('middle_name')->nullable()->after('first_name');
            }
            
            // Add date_of_birth if it doesn't exist
            if (!Schema::hasColumn('faculties', 'date_of_birth')) {
                $table->date('date_of_birth')->nullable()->after('last_name');
            }
            
            // Add age column if it doesn't exist (must be before sex)
            if (!Schema::hasColumn('faculties', 'age')) {
                $table->integer('age')->nullable()->after('date_of_birth');
            }
            
            // Add sex column if it doesn't exist
            if (!Schema::hasColumn('faculties', 'sex')) {
                $table->string('sex', 10)->nullable()->after('age');
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
            // Add back title column
            if (!Schema::hasColumn('faculties', 'title')) {
                $table->string('title')->nullable()->after('position');
            }
            
            // Remove middle_name column
            if (Schema::hasColumn('faculties', 'middle_name')) {
                $table->dropColumn('middle_name');
            }
            
            // Remove date_of_birth column
            if (Schema::hasColumn('faculties', 'date_of_birth')) {
                $table->dropColumn('date_of_birth');
            }
            
            // Remove sex column
            if (Schema::hasColumn('faculties', 'sex')) {
                $table->dropColumn('sex');
            }
        });
    }
}
