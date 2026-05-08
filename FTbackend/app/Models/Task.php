<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'title',
        'description',
        'status',
        'priority',
        'project_id',
        'assigned_to',
        'created_by',
        'due_date',
        'assigned_by', // <--- new
        'assigned_at',
        
    ];

    /**
     * Relationships
     */

    // A task belongs to a project
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    // A task is assigned to a user
    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    // A task is created by a user
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
public function assigner()
{
    return $this->belongsTo(User::class, 'assigned_by');
}
    // // A task can have many comments
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    // // A task can have many attachments
    // public function attachments()
    // {
    //     return $this->hasMany(Attachment::class);
    // }

    // // A task can have many history logs
    // public function historyLogs()
    // {
    //     return $this->hasMany(TaskHistory::class);
    // }
}
