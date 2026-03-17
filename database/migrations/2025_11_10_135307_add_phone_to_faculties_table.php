<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPhoneToFacultiesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('faculties', function (Blueprint $table) {
            // Add the phone column (nullable so it won't break existing rows)
            $table->string('phone')->nullable()->after('email');
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
            // Remove the phone column if rolled back
            $table->dropColumn('phone');
        });
    }
}
