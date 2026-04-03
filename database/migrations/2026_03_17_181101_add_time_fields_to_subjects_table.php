<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddTimeFieldsToSubjectsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasTable('subjects')) {
            return;
        }
        Schema::table('subjects', function (Blueprint $table) {
            if (!Schema::hasColumn('subjects', 'time_start')) {
                $table->string('time_start', 20)->nullable()->after('schedule_time');
            }
            if (!Schema::hasColumn('subjects', 'time_end')) {
                $table->string('time_end', 20)->nullable()->after('time_start');
            }
        });
    }

    public function down()
    {
        if (!Schema::hasTable('subjects')) {
            return;
        }
        Schema::table('subjects', function (Blueprint $table) {
            $table->dropColumn(array_filter(['time_start', 'time_end'], function ($col) {
                return Schema::hasColumn('subjects', $col);
            }));
        });
    }
}
