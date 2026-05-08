<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TaskHistory;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
class TaskHistoryController extends Controller
{
public function index(Request $request)
{
    $user = Auth::user();

    if (!$user || $user->role_id !== 2) { 
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $filter = $request->query('filter', 'team'); // default to 'team'

    if ($filter === 'my') {
        // Only leader's own history
        $histories = TaskHistory::with(['task:id,title', 'user:id,name,profile_photo,role_id,team_id'])
            ->where('user_id', $user->id)
            ->orderBy('changed_at', 'desc')
            ->get();
    } else {
        // All team members including leader
        $teamUserIds = User::where('team_id', $user->team_id)->pluck('id');

        $histories = TaskHistory::with(['task:id,title', 'user:id,name,profile_photo,role_id,team_id'])
            ->whereIn('user_id', $teamUserIds)
            ->orderBy('changed_at', 'desc')
            ->get();
    }

    $histories = $histories->map(function ($history) use ($user) {
        return [
            'id' => $history->id,
            'task' => $history->task->title ?? 'N/A',
            'developer' => $history->user->name ?? 'N/A',
            'profile_photo' => $history->user->profile_photo,
            'oldStatus' => $history->old_status,
            'newStatus' => $history->new_status,
            'date' => $history->changed_at 
                ? Carbon::parse($history->changed_at)->format('Y-m-d H:i:s') 
                : null,
            'isLeader' => $history->user_id === $user->id,
        ];
    });

    return response()->json($histories);
}


public function indexx(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Base query with relations
        $query = TaskHistory::with(['task:id,title', 'user:id,name,profile_photo']);

        // Filter: all histories
        if ($request->has('all') && $request->all == 'true') {
            // no additional where needed, return all
        }
        // Filter: my histories (logged-in manager)
        else if ($request->has('my') && $request->my == 'true') {
            $query->where('user_id', $user->id);
        }
        // Filter: team histories
        else if ($request->has('team_id')) {
            $teamId = $request->team_id;
            // get users in this team
            $userIds = \App\Models\User::where('team_id', $teamId)->pluck('id');
            $query->whereIn('user_id', $userIds);
        }
        // Optional: date range filtering
        if ($request->has('from')) {
            $query->whereDate('changed_at ', '>=', $request->from);
        }
        if ($request->has('to')) {
            $query->whereDate('changed_at', '<=', $request->to);
        }

        $histories = $query->orderBy('changed_at', 'desc')->get();

        // Transform for frontend
        $result = $histories->map(function ($item) {
            return [
                'id' => $item->id,
                'task' => $item->task->title ?? 'N/A',
                'developer' => $item->user->name ?? 'N/A',
                'profile_photo' => $item->user->profile_photo ?? null,
                'oldStatus' => $item->old_status,
                'newStatus' => $item->new_status,
               'date' => $item->changed_at 
    ? Carbon::parse($item->changed_at)->format('Y-m-d H:i:s') 
    : null,
            ];
        });

        return response()->json($result);
    }

}
