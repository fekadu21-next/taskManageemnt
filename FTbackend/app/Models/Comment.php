<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_id',
        'user_id',
        'recipient_id', // add this
        'comment_text',
    ];

    // A comment belongs to a task
    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    // A comment belongs to the sender
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // A comment belongs to the recipient
public function recipient()
{
    return $this->belongsTo(User::class, 'recipient_id');
}
    // A comment can have many attachments
    public function attachments()
    {
        return $this->hasMany(Attachment::class);
    }
}
