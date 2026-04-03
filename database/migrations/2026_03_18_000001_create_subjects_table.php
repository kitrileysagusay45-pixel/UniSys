<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSubjectsTable extends Migration
{
    public function up()
    {
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->string('name', 150);
            $table->string('department', 100)->nullable();
            $table->unsignedBigInteger('course_id')->nullable();
            $table->unsignedBigInteger('faculty_id')->nullable();
            $table->unsignedBigInteger('room_id')->nullable();
            $table->string('schedule_day', 50)->nullable();
            $table->string('schedule_time', 50)->nullable();
            $table->string('time_start', 20)->nullable();
            $table->string('time_end', 20)->nullable();
            $table->string('semester', 20)->nullable();
            $table->string('academic_year', 20)->nullable();
            $table->string('status', 20)->default('Active');
            $table->timestamps();

            $table->foreign('course_id')->references('id')->on('courses')->onDelete('set null');
            $table->foreign('faculty_id')->references('id')->on('faculties')->onDelete('set null');
            $table->foreign('room_id')->references('id')->on('rooms')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('subjects');
    }
}
