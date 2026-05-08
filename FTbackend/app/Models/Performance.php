<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Performance extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'total_tasks',
        'completed_tasks',
        'on_time_tasks',
        'overdue_tasks',
        'avg_completion_days',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
