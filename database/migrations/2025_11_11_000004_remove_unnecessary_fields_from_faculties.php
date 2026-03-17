<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class RemoveUnnecessaryFieldsFromFaculties extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('faculties', function (Blueprint $table) {
            // Drop columns that are not in the fill-up form
            $columnsToRemove = [
                'name',              // Auto-generated from first_name + last_name
                'personal_email',
                'office_location',
                'username',
                'password',
                'photo',
                'date_of_joining',
                'office_address',
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
            ];
            
            foreach ($columnsToRemove as $column) {
                if (Schema::hasColumn('faculties', $column)) {
                    $table->dropColumn($column);
                }
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
            // Add back the columns
            if (!Schema::hasColumn('faculties', 'name')) {
                $table->string('name')->nullable()->after('faculty_id');
            }
            if (!Schema::hasColumn('faculties', 'personal_email')) {
                $table->string('personal_email')->nullable()->after('email');
            }
            if (!Schema::hasColumn('faculties', 'office_location')) {
                $table->string('office_location')->nullable();
            }
            if (!Schema::hasColumn('faculties', 'username')) {
                $table->string('username')->nullable();
            }
            if (!Schema::hasColumn('faculties', 'password')) {
                $table->string('password')->nullable();
            }
            if (!Schema::hasColumn('faculties', 'photo')) {
                $table->string('photo')->nullable();
            }
            if (!Schema::hasColumn('faculties', 'date_of_joining')) {
                $table->date('date_of_joining')->nullable();
            }
            if (!Schema::hasColumn('faculties', 'office_address')) {
                $table->string('office_address')->nullable();
            }
            if (!Schema::hasColumn('faculties', 'mobile_phone')) {
                $table->string('mobile_phone')->nullable();
            }
            if (!Schema::hasColumn('faculties', 'highest_degree')) {
                $table->string('highest_degree')->nullable();
            }
            if (!Schema::hasColumn('faculties', 'field_of_study')) {
                $table->string('field_of_study')->nullable();
            }
            if (!Schema::hasColumn('faculties', 'awarding_institution')) {
                $table->string('awarding_institution')->nullable();
            }
            if (!Schema::hasColumn('faculties', 'year_awarded')) {
                $table->string('year_awarded')->nullable();
            }
            if (!Schema::hasColumn('faculties', 'teaching_subjects')) {
                $table->text('teaching_subjects')->nullable();
            }
            if (!Schema::hasColumn('faculties', 'research_interests')) {
                $table->text('research_interests')->nullable();
            }
            if (!Schema::hasColumn('faculties', 'publications')) {
                $table->text('publications')->nullable();
            }
            if (!Schema::hasColumn('faculties', 'professional_experience')) {
                $table->text('professional_experience')->nullable();
            }
            if (!Schema::hasColumn('faculties', 'achievements_awards')) {
                $table->text('achievements_awards')->nullable();
            }
        });
    }
}
