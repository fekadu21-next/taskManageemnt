<?php

namespace App\Models;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Hash;
use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\CanResetPassword;
use Illuminate\Auth\Passwords\CanResetPassword as CanResetPasswordTrait;
class User extends Authenticatable implements CanResetPassword
{
    use HasApiTokens, Notifiable, CanResetPasswordTrait;
    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'team_id',
        'profile_photo',
        'last_login',
        'is_active', 
        'last_logout',
        'last_seen_tasks_at',
        'last_seen_comments_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];
    /**
     * Automatically hash password when setting it,
     * but only if it’s not already hashed.
     */
public function setPasswordAttribute($value)
{
    if (!empty($value)) {
        // Check if the value is already a bcrypt hash
        if (!preg_match('/^\$2[ayb]\$.{56}$/', $value)) {
            // Plain text → hash it
            $this->attributes['password'] = Hash::make($value);
        } else {
            // Already hashed → leave it as is
            $this->attributes['password'] = $value;
        }
    }
}
    /**
     * Get full URL for profile photo or null if not set.
     */
    public function getProfilePhotoAttribute($value)
    {
        return $value ? asset('storage/' . $value) : null;
    }
    /**
     * Relationships
     */
    public function role()
    {
        return $this->belongsTo(Role::class);
    }
    public function team()
    {
        return $this->belongsTo(Team::class);
    }
    public function comments()
{
    return $this->hasMany(Comment::class);
}
    /**
     * Scope for active users
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
    /**
     * Scope for inactive users
     */
    public function scopeInactive($query)
    {
        return $query->where('is_active', false);
    }
}
