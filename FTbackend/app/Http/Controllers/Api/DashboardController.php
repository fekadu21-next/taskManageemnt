<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Task;
use App\Models\User;
class DashboardController extends Controller
{
    /**
     * Display dashboard stats for team leader
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        // Only team leader can access (assuming role_id 2 = leader)
        if (!$user || $user->role_id !== 2) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $teamId = $user->team_id;

        // Get all team member IDs including leader
        $teamUserIds = User::where('team_id', $teamId)->pluck('id');

        // Total tasks for the team
        $totalTasks = Task::whereIn('assigned_to', $teamUserIds)->count();

        // Task counts by status
        $statusCounts = Task::whereIn('assigned_to', $teamUserIds)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $todoCount = $statusCounts['To Do'] ?? 0;
        $inProgressCount = $statusCounts['In Progress'] ?? 0;
        $underReviewCount = $statusCounts['Under Review'] ?? 0;
        $completedCount = $statusCounts['Completed'] ?? 0;

        // 4 recent completed tasks
        $recentCompletedTasks = Task::whereIn('assigned_to', $teamUserIds)
            ->where('status', 'Completed')
            ->orderBy('updated_at', 'desc')
            ->take(4)
            ->with('assignee:id,name') // using your existing relation
            ->get()
            ->map(function ($task) {
                return [
                    'task_name' => $task->title,
                    'completed_by' => $task->assignee->name ?? 'N/A',
                    'completed_at' => $task->updated_at->format('Y-m-d H:i:s'),
                ];
            });

        // Return as JSON
        return response()->json([
            'total_tasks' => $totalTasks,
            'todo_count' => $todoCount,
            'in_progress_count' => $inProgressCount,
            'under_review_count' => $underReviewCount,
            'completed_count' => $completedCount,
            'recent_completed_tasks' => $recentCompletedTasks,
        ]);
    }
    public function indexx(Request $request)
    {
        $user = Auth::user();

        // Only managers can access (assuming role_id 1 = manager)
        // if (!$user || $user->role_id !== 1) {
        //     return response()->json(['message' => 'Unauthorized'], 403);
        // }

        // Get all users IDs across all teams
        $allUserIds = User::pluck('id');

        // Total tasks for all users
        $totalTasks = Task::whereIn('assigned_to', $allUserIds)->count();

        // Task counts by status
        $statusCounts = Task::whereIn('assigned_to', $allUserIds)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $todoCount = $statusCounts['To Do'] ?? 0;
        $inProgressCount = $statusCounts['In Progress'] ?? 0;
        $underReviewCount = $statusCounts['Under Review'] ?? 0;
        $completedCount = $statusCounts['Completed'] ?? 0;

        // 4 recent completed tasks across all users
        $recentCompletedTasks = Task::whereIn('assigned_to', $allUserIds)
            ->where('status', 'Completed')
            ->orderBy('updated_at', 'desc')
            ->take(4)
            ->with('assignee:id,name') // assuming Task has 'assignee' relation
            ->get()
            ->map(function ($task) {
                return [
                    'task_name'     => $task->title,
                    'completed_by'  => $task->assignee->name ?? 'N/A',
                    'completed_at'  => $task->updated_at->format('Y-m-d H:i:s'),
                ];
            });
        // Return as JSON
        return response()->json([
            'total_tasks'            => $totalTasks,
            'todo_count'             => $todoCount,
            'in_progress_count'      => $inProgressCount,
            'under_review_count'     => $underReviewCount,
            'completed_count'        => $completedCount,
            'recent_completed_tasks' => $recentCompletedTasks,
        ]);
    }
}
