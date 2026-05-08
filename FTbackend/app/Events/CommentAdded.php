<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CommentAdded implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $comment;

    public function __construct($comment)
    {
        $this->comment = $comment;
    }

    public function broadcastOn()
    {
        // Channel per task
        return new PrivateChannel('comments.' . $this->comment->task_id);
    }

    public function broadcastWith()
    {
        return [
            'task_id' => $this->comment->task_id,
            'comment_text' => $this->comment->body,
            'commented_by' => $this->comment->user->name,
        ];
    }
}
