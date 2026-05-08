<?php

namespace App\Providers;

use Illuminate\Support\Facades\Broadcast;

use Illuminate\Support\ServiceProvider;

class BroadcastServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
   public function boot()
{
    Broadcast::routes(['middleware' => ['auth:api']]); // or 'auth:sanctum' if using sanctum

    require base_path('routes/channels.php');
}
}
