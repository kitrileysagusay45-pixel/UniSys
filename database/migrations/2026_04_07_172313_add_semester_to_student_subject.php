<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddSemesterToStudentSubject extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('student_subject', function (Blueprint $table) {
            $table->string('semester')->after('subject_id');
            $table->string('academic_year')->after('semester');
        });
    }

    public function down()
    {
        Schema::table('student_subject', function (Blueprint $table) {
            $table->dropColumn(['semester', 'academic_year']);
        });
    }
}
