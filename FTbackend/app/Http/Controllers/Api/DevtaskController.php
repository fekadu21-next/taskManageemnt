<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // ← important
use App\Models\Task;                 // ← important
use App\Models\Project;
use App\Models\User;
use App\Models\Comment;
use App\Models\TaskHistory;

use Carbon\Carbon;

// use App\Models\Comment;
// use App\Models\Attachment;
// use App\Models\TaskHistory;

class DevtaskController extends Controller
{
public function getDeveloperTasks()
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
            }

            if ($user->role_id !== 2 && $user->role_id !== 3) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only developers can access their tasks.'
                ], 403);
            }
            // Fetch tasks with relationships
            $tasks = Task::with([
                'project',
                'assignee',
                'creator',
                'assigner',
                // 'comments',
                // 'attachments',
                // 'historyLogs'
            ])->where('assigned_to', $user->id)
              ->orderBy('due_date', 'asc')
              ->get();

            // Count tasks by status (case-insensitive)
            $statusCounts = [
                'total'        => $tasks->count(),
                'in_progress'  => $tasks->where('status', 'in_progress')->count()
                                    + $tasks->where('status', 'In Progress')->count(),
                'under_review' => $tasks->where('status', 'under_review')->count()
                                    + $tasks->where('status', 'Under Review')->count(),
                'completed'    => $tasks->where('status', 'completed')->count()
                                    + $tasks->where('status', 'Completed')->count(),
            ];

            return response()->json([
                'success'       => true,
                'tasks'         => $tasks,
                'status_counts' => $statusCounts
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

public function summary()
{
    try {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success'=>false,'message'=>'Unauthenticated'], 401);
        }

        $today = Carbon::today();
        $weekStart = Carbon::now()->startOfWeek();

        // ---------------- Performance Overview ----------------
        // Tasks completed this week (count based on updated_at when marked Completed)
        $tasksCompletedThisWeek = Task::where('assigned_to', $user->id)
            ->where('status', 'Completed')
            ->whereBetween('updated_at', [$weekStart, $today->endOfDay()])
            ->count();

        // Tasks completed on time (completed before or on due_date)
        $tasksCompletedOnTime = Task::where('assigned_to', $user->id)
            ->where('status', 'Completed')
            ->whereColumn('updated_at', '<=', 'due_date')
            ->count();

        // Total completed tasks
        $totalCompletedTasks = Task::where('assigned_to', $user->id)
            ->where('status', 'Completed')
            ->count();

        // On-time completion rate = (on-time completed / total completed) * 100
        $onTimeRate = $totalCompletedTasks > 0 
            ? round(($tasksCompletedOnTime / $totalCompletedTasks) * 100, 2) 
            : 0;

        // ---------------- Upcoming Deadlines (next 3) ----------------
        $upcomingDeadlines = Task::where('assigned_to', $user->id)
            ->where('status', '!=', 'Completed')
            ->orderBy('due_date', 'asc')
            ->limit(3)
            ->get(['id','title','due_date']);

        // ---------------- Recent Activity (last 3 comments) ----------------
$recentComments = Comment::with('user')
    ->where('recipient_id', $user->id)   // ✅ Only comments where the logged-in user is recipient
    ->orderBy('created_at', 'desc')      // ✅ Latest first
    ->take(3)                            // ✅ Only 3 recent
    ->get(['id','task_id','user_id','recipient_id','comment_text','created_at']);


        // ---------------- Notifications ----------------
        // Overdue tasks (not completed, past due_date)
        $overdueTasks = Task::where('assigned_to', $user->id)
            ->where('status', '!=', 'Completed')
            ->where('due_date', '<', $today)
            ->orderBy('due_date','asc')
            ->limit(2)
            ->get(['id','title','due_date']);

        // Recently completed tasks (last 2 by updated_at)
        $recentCompletedTasks = Task::where('assigned_to', $user->id)
            ->where('status', 'Completed')
            ->orderBy('updated_at','desc')
            ->limit(2)
            ->get(['id','title','updated_at']);

        return response()->json([
            'success' => true,
            'performance_overview' => [
                'tasks_completed_this_week' => $tasksCompletedThisWeek,
                'tasksCompletedOnTime' => $tasksCompletedOnTime,
                'on_time_completion_rate' => $onTimeRate
            ],
            'upcoming_deadlines' => $upcomingDeadlines,
            'recent_activity' => $recentComments,
            'notifications' => [
                'overdue_tasks' => $overdueTasks,
                'recent_completed_tasks' => $recentCompletedTasks
            ]
        ]);

    } catch (\Throwable $e) {
        return response()->json([
            'success'=>false,
            'message'=>$e->getMessage()
        ], 500);
    }
}

    public function markTasksSeen(Request $request)
{
    $user = Auth::user();
    if (!$user) {
        return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
    }

    $user->last_seen_tasks_at = now();
    $user->save();

    return response()->json(['success' => true, 'message' => 'Tasks marked as seen']);
}

}
