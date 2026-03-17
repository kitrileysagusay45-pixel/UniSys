<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddSchoolIdAndRelationshipsToStudents extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('students', function (Blueprint $table) {
            $table->string('school_id')->unique()->nullable()->after('id');
            $table->foreignId('user_id')->nullable()->after('school_id')->constrained()->onDelete('set null');
            $table->foreignId('program_id')->nullable()->after('user_id')->constrained();
            $table->foreignId('year_level_id')->nullable()->after('program_id')->constrained();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['program_id']);
            $table->dropForeign(['year_level_id']);
            $table->dropColumn(['school_id', 'user_id', 'program_id', 'year_level_id']);
        });
    }
}
