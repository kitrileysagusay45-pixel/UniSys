<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddMissingColumnsToStudentsAndFacultiesTables extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('students', function (Blueprint $table) {
            if (!Schema::hasColumn('students', 'photo')) {
                $table->string('photo')->nullable()->after('address');
            }
        });

        Schema::table('faculties', function (Blueprint $table) {
            if (!Schema::hasColumn('faculties', 'date_hired')) {
                $table->date('date_hired')->nullable()->after('employment_type');
            }
            if (!Schema::hasColumn('faculties', 'office_phone')) {
                $table->string('office_phone')->nullable()->after('date_hired');
            }
        });
    }

    public function down()
    {
        Schema::table('students', function (Blueprint $table) {
            if (Schema::hasColumn('students', 'photo')) {
                $table->dropColumn('photo');
            }
        });

        Schema::table('faculties', function (Blueprint $table) {
            if (Schema::hasColumn('faculties', 'date_hired')) {
                $table->dropColumn('date_hired');
            }
            if (Schema::hasColumn('faculties', 'office_phone')) {
                $table->dropColumn('office_phone');
            }
        });
    }
}
