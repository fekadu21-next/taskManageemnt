<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Customize the Reset Password email to point to your React frontend
        ResetPassword::toMailUsing(function ($notifiable, $token) {
            $frontend = config('app.frontend_url', 'http://localhost:5173');
            $email = $notifiable->getEmailForPasswordReset();
            $url = "{$frontend}/reset-password/{$token}?email={$email}";

            return (new MailMessage)
                ->subject('Reset your password')
                ->line('We received a password reset request for your account.')
                ->action('Reset Password', $url)
                ->line('If you did not request a password reset, no further action is required.');
        });
    }
}
