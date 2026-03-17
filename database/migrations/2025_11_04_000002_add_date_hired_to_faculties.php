<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('faculties', function (Blueprint $table) {
            // Add date_hired column if it doesn't exist
            if (!Schema::hasColumn('faculties', 'date_hired')) {
                $table->date('date_hired')->nullable()->after('position');
            }
        });
    }

    public function down()
    {
        Schema::table('faculties', function (Blueprint $table) {
            if (Schema::hasColumn('faculties', 'date_hired')) {
                $table->dropColumn('date_hired');
            }
        });
    }
};
