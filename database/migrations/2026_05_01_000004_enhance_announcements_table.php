<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class EnhanceAnnouncementsTable extends Migration
{
    public function up()
    {
        Schema::table('announcements', function (Blueprint $table) {
            $table->unsignedBigInteger('faculty_id')->nullable()->after('id');
            $table->foreign('faculty_id')->references('id')->on('faculties')->onDelete('set null');

            $table->string('section', 20)->nullable()->after('target_role');
            $table->string('department', 100)->nullable()->after('section');
            $table->string('category', 50)->default('general_advisory')->after('type');
            // category values: exam_schedule, activity_notice, requirement_reminder, general_advisory
        });
    }

    public function down()
    {
        Schema::table('announcements', function (Blueprint $table) {
            $table->dropForeign(['faculty_id']);
            $table->dropColumn(['faculty_id', 'section', 'department', 'category']);
        });
    }
}
