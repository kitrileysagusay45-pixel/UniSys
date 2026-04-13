<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAccountActivityLogsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('account_activity_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('loggable_id');
            $table->string('loggable_type'); 
            $table->string('action'); // Activated, Rejected, Updated, Created
            $table->text('reason')->nullable();
            $table->unsignedBigInteger('performed_by')->nullable(); // Admin User ID
            $table->timestamps();

            $table->index(['loggable_id', 'loggable_type']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('account_activity_logs');
    }
}
