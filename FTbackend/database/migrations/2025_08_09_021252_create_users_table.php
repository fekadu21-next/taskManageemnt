<?php
// database/migrations/2025_08_11_000003_create_users_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('email', 100)->unique();
            $table->string('password'); // Laravel convention for password field
            $table->unsignedBigInteger('role_id');
            $table->unsignedBigInteger('team_id')->nullable();
            $table->string('profile_photo')->nullable();
            $table->dateTime('last_login')->nullable();
            $table->timestamps();

            $table->foreign('role_id')->references('id')->on('roles')->onDelete('restrict');
            $table->foreign('team_id')->references('id')->on('teams')->onDelete('set null');
            
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
}
