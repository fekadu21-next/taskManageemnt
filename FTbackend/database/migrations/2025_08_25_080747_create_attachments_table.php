<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attachments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('comment_id');
            $table->string('file_url', 255);
            $table->string('file_name', 100)->nullable();
            $table->timestamps(); // includes uploaded_at via created_at

            // Foreign key
            $table->foreign('comment_id')
                  ->references('id')->on('comments')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attachments');
    }
};
