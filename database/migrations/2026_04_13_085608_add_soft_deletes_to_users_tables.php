<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddSoftDeletesToUsersTables extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('students', function (Blueprint $table) {
            $table->softDeletes();
        });
        Schema::table('faculties', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
        Schema::table('faculties', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
}
