<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'comment_id',
        'file_url',
        'file_name',
    ];

    // Attachment belongs to a comment
    public function comment()
    {
        return $this->belongsTo(Comment::class);
    }
}
