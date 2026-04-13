<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateFacultyProfilesForVerification extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('faculties', function (Blueprint $table) {
            $table->string('specialization')->nullable()->after('department');
            $table->string('subject_assignment')->nullable()->after('specialization');
            $table->text('rejection_reason')->nullable()->after('status');
        });
    }

    public function down()
    {
        Schema::table('faculties', function (Blueprint $table) {
            $table->dropColumn(['specialization', 'subject_assignment', 'rejection_reason']);
        });
    }
}
