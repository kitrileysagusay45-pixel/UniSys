<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddSchoolIdAndPositionToFaculties extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('faculties', function (Blueprint $table) {
            if (!Schema::hasColumn('faculties', 'school_id')) {
                $table->string('school_id')->unique()->nullable()->after('id');
            }
            if (!Schema::hasColumn('faculties', 'user_id')) {
                $table->foreignId('user_id')->nullable()->after('school_id')->constrained()->onDelete('set null');
            }
            if (!Schema::hasColumn('faculties', 'position')) {
                $table->string('position')->nullable()->after('user_id');
            }
            if (!Schema::hasColumn('faculties', 'department_id')) {
                $table->foreignId('department_id')->nullable()->after('position')->constrained();
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
            $table->dropForeign(['user_id']);
            $table->dropForeign(['department_id']);
            $table->dropColumn(['school_id', 'user_id', 'position', 'department_id']);
        });
    }
}
