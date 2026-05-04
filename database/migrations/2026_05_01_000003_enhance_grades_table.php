<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class EnhanceGradesTable extends Migration
{
    public function up()
    {
        Schema::table('grades', function (Blueprint $table) {
            // Add subject reference
            $table->unsignedBigInteger('subject_id')->nullable()->after('course_id');
            $table->foreign('subject_id')->references('id')->on('subjects')->onDelete('set null');

            // Three grading periods
            $table->decimal('prelim', 3, 2)->nullable()->after('grade');
            $table->decimal('midterm', 3, 2)->nullable()->after('prelim');
            $table->decimal('finals', 3, 2)->nullable()->after('midterm');
            $table->decimal('final_grade', 3, 2)->nullable()->after('finals');

            // Grading period tracker
            $table->string('grading_period', 20)->nullable()->after('final_grade');
            // grading_period values: prelim, midterm, finals
        });

        // Migrate existing grade data to finals column
        \Illuminate\Support\Facades\DB::statement('UPDATE grades SET finals = grade, final_grade = grade WHERE grade IS NOT NULL');
    }

    public function down()
    {
        Schema::table('grades', function (Blueprint $table) {
            $table->dropForeign(['subject_id']);
            $table->dropColumn([
                'subject_id',
                'prelim',
                'midterm',
                'finals',
                'final_grade',
                'grading_period',
            ]);
        });
    }
}
