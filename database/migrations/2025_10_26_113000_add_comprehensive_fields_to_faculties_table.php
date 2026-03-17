<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('faculties', function (Blueprint $table) {
            // Basic Information - Split name
            $table->string('first_name')->nullable()->after('faculty_id');
            $table->string('last_name')->nullable()->after('first_name');
            $table->string('employee_id')->nullable()->after('faculty_id');
            $table->string('title')->nullable()->after('position'); // e.g., Assistant Professor, Lecturer, Dean
            $table->string('employment_type')->nullable()->after('title'); // Full-time / Part-time / Adjunct / Visiting
            $table->date('date_of_joining')->nullable()->after('employment_type');
            
            // Contact Details
            $table->string('office_address')->nullable()->after('date_of_joining');
            $table->string('personal_email')->nullable()->after('email');
            $table->string('office_phone')->nullable()->after('personal_email');
            $table->string('mobile_phone')->nullable()->after('office_phone');
            
            // Academic Qualifications
            $table->string('highest_degree')->nullable()->after('mobile_phone'); // Ph.D., M.Sc., etc.
            $table->string('field_of_study')->nullable()->after('highest_degree');
            $table->string('awarding_institution')->nullable()->after('field_of_study');
            $table->string('year_awarded')->nullable()->after('awarding_institution');
            
            // Professional Information
            $table->text('teaching_subjects')->nullable()->after('year_awarded'); // JSON or comma-separated
            $table->text('research_interests')->nullable()->after('teaching_subjects');
            $table->text('publications')->nullable()->after('research_interests');
            $table->text('professional_experience')->nullable()->after('publications');
            $table->text('achievements_awards')->nullable()->after('professional_experience');
        });
    }

    public function down()
    {
        Schema::table('faculties', function (Blueprint $table) {
            $table->dropColumn([
                'first_name',
                'last_name',
                'employee_id',
                'title',
                'employment_type',
                'date_of_joining',
                'office_address',
                'personal_email',
                'office_phone',
                'mobile_phone',
                'highest_degree',
                'field_of_study',
                'awarding_institution',
                'year_awarded',
                'teaching_subjects',
                'research_interests',
                'publications',
                'professional_experience',
                'achievements_awards',
            ]);
        });
    }
};
