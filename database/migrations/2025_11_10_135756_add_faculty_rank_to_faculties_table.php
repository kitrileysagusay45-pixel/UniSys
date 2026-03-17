<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddFacultyRankToFacultiesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('faculties', function (Blueprint $table) {
            // Add faculty_rank column (nullable)
            $table->string('faculty_rank')->nullable()->after('position');
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
            $table->dropColumn('faculty_rank');
        });
    }
}
