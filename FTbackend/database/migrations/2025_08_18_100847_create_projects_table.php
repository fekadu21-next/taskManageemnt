<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id(); // id
            $table->string('name', 100); // project name
            $table->text('description')->nullable(); // optional description
            $table->foreignId('team_id')->nullable()->constrained('teams')->onDelete('set null'); // optional team
            $table->date('start_date'); // project start
            $table->date('end_date'); // project end
            $table->integer('progress')->default(0); // progress %
            $table->enum('status', ['Pending','In Progress','Completed'])->default('Pending'); // project status
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade'); // who created
            $table->timestamps(); // created_at, updated_at
        });
    }

    public function down()
    {
        Schema::dropIfExists('projects');
    }
};
