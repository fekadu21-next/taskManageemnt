<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class RemoveTeamLeaderIdFromTeamsTable extends Migration
{
    public function up()
    {
        Schema::table('teams', function (Blueprint $table) {
            // Drop foreign key first (name is usually table_column_foreign)
            if (Schema::hasColumn('teams', 'team_leader_id')) {
                $table->dropForeign(['team_leader_id']);
                $table->dropColumn('team_leader_id');
            }
        });
    }

    public function down()
    {
        Schema::table('teams', function (Blueprint $table) {
            $table->unsignedBigInteger('team_leader_id')->nullable();
            $table->foreign('team_leader_id')->references('id')->on('users')->onDelete('set null');
        });
    }
}
