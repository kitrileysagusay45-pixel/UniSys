<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('students', function (Blueprint $table) {
            // Drop excess fields
            $table->dropColumn([
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

        Schema::table('students', function (Blueprint $table) {
            // Add new required fields
            $table->string('middle_name')->nullable()->after('first_name');
            $table->integer('age')->nullable()->after('date_of_birth');
            $table->enum('sex', ['Male', 'Female'])->nullable()->after('age');
            $table->string('phone')->nullable()->after('email');
            $table->text('address')->nullable()->after('phone');
            $table->string('photo')->nullable()->after('address');
            $table->date('date_hired')->nullable()->after('year_level');
        });
    }

    public function down()
    {
        Schema::table('students', function (Blueprint $table) {
            // Restore old fields
            $table->string('street_address')->nullable();
            $table->string('street_address_line2')->nullable();
            $table->string('city')->nullable();
            $table->string('state_province')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('emergency_contact_first_name')->nullable();
            $table->string('emergency_contact_last_name')->nullable();
            $table->string('emergency_contact_relationship')->nullable();
            $table->string('emergency_contact_email')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->string('parent_guardian_first_name')->nullable();
            $table->string('parent_guardian_last_name')->nullable();
            $table->string('parent_guardian_relationship')->nullable();
            $table->string('parent_guardian_phone')->nullable();
            $table->string('parent_guardian_email')->nullable();
            $table->string('previous_school')->nullable();
            $table->string('grade_level')->nullable();
            $table->string('previous_student_id')->nullable();
            $table->text('special_needs')->nullable();
            
            // Drop new fields
            $table->dropColumn([
                'middle_name',
                'age',
                'sex',
                'phone',
                'address',
                'photo',
                'date_hired',
            ]);
        });
    }
};
