<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddRoomIdToGradesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('grades', function (Blueprint $table) {
            $table->foreignId('room_id')->nullable()->after('faculty_id')->constrained()->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('grades', function (Blueprint $table) {
            $table->dropForeign(['room_id']);
            $table->dropColumn('room_id');
        });
    }
}
