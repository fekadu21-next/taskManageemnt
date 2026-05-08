<?php

namespace App\Events;

use App\Models\Task;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class TaskAssigned implements ShouldBroadcast
{
    use SerializesModels;

    public $task;

    public function __construct(Task $task)
    {
        $this->task = $task;
    }

    // Channel for the specific user
    public function broadcastOn()
    {
        return new PrivateChannel('user.' . $this->task->assigned_to);
    }

    // Optional custom event name
    public function broadcastAs()
    {
        return 'task.assigned';
    }
}
