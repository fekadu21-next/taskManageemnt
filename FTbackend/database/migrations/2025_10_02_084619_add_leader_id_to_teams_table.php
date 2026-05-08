<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddLeaderIdToTeamsTable extends Migration
{
    public function up()
    {
        Schema::table('teams', function (Blueprint $table) {
            // Add new leader_id column
            $table->unsignedBigInteger('leader_id')->nullable()->after('name');

            // Set foreign key (optional but recommended)
            $table->foreign('leader_id')->references('id')->on('users')->onDelete('set null');
        });
    }
    public function down()
    {
        Schema::table('teams', function (Blueprint $table) {
            // Drop foreign key first, then column
            $table->dropForeign(['leader_id']);
            $table->dropColumn('leader_id');
        });
    }
}
