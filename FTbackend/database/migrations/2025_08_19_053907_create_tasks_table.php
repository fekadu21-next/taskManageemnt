<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('title', 150);
            $table->text('description')->nullable();
            $table->enum('status', ['To Do', 'In Progress', 'Under Review', 'Completed'])->default('To Do');
            $table->enum('priority', ['Low', 'Medium', 'High', 'Critical'])->default('Medium');

            $table->unsignedBigInteger('project_id');
            $table->unsignedBigInteger('assigned_to');
            $table->unsignedBigInteger('created_by');

            $table->date('due_date')->nullable();

            $table->timestamps();

            // Foreign Keys
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
            $table->foreign('assigned_to')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
