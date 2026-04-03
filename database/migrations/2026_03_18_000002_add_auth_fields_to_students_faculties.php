<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddAuthFieldsToStudentsFaculties extends Migration
{
    public function up()
    {
        Schema::table('students', function (Blueprint $table) {
            if (!Schema::hasColumn('students', 'password')) {
                $table->string('password')->nullable()->after('email');
            }
            if (!Schema::hasColumn('students', 'section')) {
                $table->string('section', 50)->nullable()->after('course');
            }
        });

        Schema::table('faculties', function (Blueprint $table) {
            if (!Schema::hasColumn('faculties', 'password')) {
                $table->string('password')->nullable()->after('email');
            }
            if (!Schema::hasColumn('faculties', 'tin_number')) {
                $table->string('tin_number', 50)->nullable()->after('address');
            }
        });
    }

    public function down()
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn(['password', 'section']);
        });

        Schema::table('faculties', function (Blueprint $table) {
            $table->dropColumn(['password', 'tin_number']);
        });
    }
}
