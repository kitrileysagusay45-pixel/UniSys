<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('faculties', function (Blueprint $table) {
            $table->id();
            $table->string('faculty_id')->unique();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('department');
            $table->string('position');
            $table->string('status')->default('Active');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('faculties');
    }
};
