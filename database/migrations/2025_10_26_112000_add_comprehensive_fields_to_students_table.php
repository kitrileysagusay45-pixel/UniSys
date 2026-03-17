<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('students', function (Blueprint $table) {
            // Split name into first and last
            $table->string('first_name')->nullable()->after('student_id');
            $table->string('last_name')->nullable()->after('first_name');
            
            // Student Information
            $table->date('date_of_birth')->nullable()->after('email');
            
            // Home Address
            $table->string('street_address')->nullable()->after('date_of_birth');
            $table->string('street_address_line2')->nullable()->after('street_address');
            $table->string('city')->nullable()->after('street_address_line2');
            $table->string('state_province')->nullable()->after('city');
            $table->string('postal_code')->nullable()->after('state_province');
            
            // Emergency Contact
            $table->string('emergency_contact_first_name')->nullable()->after('postal_code');
            $table->string('emergency_contact_last_name')->nullable()->after('emergency_contact_first_name');
            $table->string('emergency_contact_relationship')->nullable()->after('emergency_contact_last_name');
            $table->string('emergency_contact_email')->nullable()->after('emergency_contact_relationship');
            $table->string('emergency_contact_phone')->nullable()->after('emergency_contact_email');
            
            // Parent/Guardian
            $table->string('parent_guardian_first_name')->nullable()->after('emergency_contact_phone');
            $table->string('parent_guardian_last_name')->nullable()->after('parent_guardian_first_name');
            $table->string('parent_guardian_relationship')->nullable()->after('parent_guardian_last_name');
            $table->string('parent_guardian_phone')->nullable()->after('parent_guardian_relationship');
            $table->string('parent_guardian_email')->nullable()->after('parent_guardian_phone');
            
            // Educational Background
            $table->string('previous_school')->nullable()->after('parent_guardian_email');
            $table->string('grade_level')->nullable()->after('previous_school');
            $table->string('previous_student_id')->nullable()->after('grade_level');
            $table->text('special_needs')->nullable()->after('previous_student_id');
        });
    }

    public function down()
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn([
                'first_name',
                'last_name',
                'date_of_birth',
                'street_address',
                'street_address_line2',
                'city',
                'state_province',
                'postal_code',
                'emergency_contact_first_name',
                'emergency_contact_last_name',
                'emergency_contact_relationship',
                'emergency_contact_email',
                'emergency_contact_phone',
                'parent_guardian_first_name',
                'parent_guardian_last_name',
                'parent_guardian_relationship',
                'parent_guardian_phone',
                'parent_guardian_email',
                'previous_school',
                'grade_level',
                'previous_student_id',
                'special_needs',
            ]);
        });
    }
};
