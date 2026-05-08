<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTaskHistoriesTable extends Migration
{
    public function up()
    {
        Schema::create('task_histories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('task_id');
            $table->unsignedBigInteger('user_id'); // who changed the task
            $table->enum('old_status', ['To Do', 'In Progress', 'Under Review', 'Completed'])->nullable();
            $table->enum('new_status', ['To Do', 'In Progress', 'Under Review', 'Completed']);
            $table->timestamp('changed_at')->useCurrent();

            $table->foreign('task_id')->references('id')->on('tasks')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('task_histories');
    }
}
