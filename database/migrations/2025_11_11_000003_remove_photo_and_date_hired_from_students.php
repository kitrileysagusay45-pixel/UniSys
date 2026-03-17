<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class RemovePhotoAndDateHiredFromStudents extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('students', function (Blueprint $table) {
            // Remove photo column if it exists
            if (Schema::hasColumn('students', 'photo')) {
                $table->dropColumn('photo');
            }
            
            // Remove date_hired column if it exists
            if (Schema::hasColumn('students', 'date_hired')) {
                $table->dropColumn('date_hired');
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
        Schema::table('students', function (Blueprint $table) {
            // Add back photo column
            if (!Schema::hasColumn('students', 'photo')) {
                $table->string('photo')->nullable()->after('address');
            }
            
            // Add back date_hired column
            if (!Schema::hasColumn('students', 'date_hired')) {
                $table->date('date_hired')->nullable()->after('year_level');
            }
        });
    }
}
