<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddSecurityPrivacyFieldsToUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('registration_type')->default('default')->after('role');
            $table->boolean('privacy_personal_visible')->default(true)->after('registration_type');
            $table->boolean('privacy_academic_visible')->default(true)->after('privacy_personal_visible');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['registration_type', 'privacy_personal_visible', 'privacy_academic_visible']);
        });
    }
}
