<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskHistory;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Broadcast;
class TaskController extends Controller
{

    // Return all tasks with related project, assignee, and creator
    public function index(Request $request)
    {
        $query = Task::with(['project:id,name', 'assignee:id,name', 'assigner:id,name','creator:id,name']);
        // Filters
        if ($request->filled('project') && $request->project !== 'All') {
            $query->where('project_id', $request->project);
        }
        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }
        if ($request->filled('priority') && $request->priority !== 'All') {
            $query->where('priority', $request->priority);
        }
        if ($request->filled('assignee_id') && $request->assignee_id !== 'All') {
            $query->where('assigned_to', $request->assignee_id);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%")
                  ->orWhereHas('project', fn($p) => $p->where('name', 'LIKE', "%{$search}%"))
                  ->orWhereHas('assignee', fn($u) => $u->where('name', 'LIKE', "%{$search}%"));
            });
        }
        $tasks = $query->orderBy('due_date', 'asc')->get();
        return response()->json(['tasks' => $tasks]);
    }
public function indexx(Request $request)
    {
        $user = Auth::user();

        $query = Task::with(['project', 'assignee', 'creator','assigner']);

        // If leader, only show tasks from projects assigned to their team
        if ($user->role_id === 2 && $user->team_id) {
            $teamProjectIds = Project::where('team_id', $user->team_id)->pluck('id');
            $query->whereIn('project_id', $teamProjectIds);
        }
        // Apply filters if present
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }
        if ($request->has('project')) {
            $query->where('project_id', $request->project);
        }
        if ($request->has('assignee_id')) {
            $query->where('assignee_id', $request->assignee_id);
        }
        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }
        $tasks = $query->get();
        return response()->json([
            'success' => true,
            'tasks' => $tasks
        ]);
    }
public function projectProgress(Request $request)
{
    $user = Auth::user();

    // Base query: always include team relationship
    $query = Project::with(['team', 'tasks']);

    // If leader: show only projects of their own team
    if ($user->role_id === 2 && $user->team_id) {
        $query->where('team_id', $user->team_id);
    }
    // If admin: show all projects (no restriction)
    elseif ($user->role_id === 1) {
        // Admins can see all projects, so no filter is applied
    }
    // If other roles (like normal employee): show projects assigned to them only
    else {
        $query->whereHas('tasks', function ($q) use ($user) {
            $q->where('assigned_to', $user->id);
        });
    }
    // Fetch projects and calculate progress dynamically
    $projects = $query->get()->map(function ($project) {
        $totalTasks = $project->tasks->count();
        $completedTasks = $project->tasks->where('status', 'Completed')->count();

        $progress = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100, 2) : 0;

        return [
            'id' => $project->id,
            'name' => $project->name,
            'description' => $project->description,
            'status' => $project->status,
            'start_date' => $project->start_date,
            'end_date' => $project->end_date,
            'team' => $project->team ? ['name' => $project->team->name] : null,
            'total_tasks' => $totalTasks,
            'completed_tasks' => $completedTasks,
            'progress' => $progress,
        ];
    });
    return response()->json([
        'success' => true,
        'projects' => $projects,
    ]);
}

// public function store(Request $request)
// {
//     $request->validate([
//         'title' => 'required|string|max:150',
//         'description' => 'nullable|string',
//         'status' => ['required', Rule::in(['To Do','In Progress','Under Review','Completed'])],
//         'priority' => ['required', Rule::in(['Low','Medium','High','Critical'])],
//         'project_id' => 'required|exists:projects,id',
//         'assigned_to' => 'nullable|exists:users,id',
//         'created_by' => 'required|exists:users,id',
//         'due_date' => 'nullable|date',
//     ]);

//     $data = $request->all();

//     if (!empty($request->assigned_to)) {
//         $data['assigned_by'] = auth()->id();
//         $data['assigned_at'] = now();
//     }

//     $task = Task::create($data);

//     TaskHistory::create([
//         'task_id' => $task->id,
//         'user_id' => auth()->id(),
//         'old_status' => null,
//         'new_status' => $task->status,
//         'changed_at' => now(),
//     ]);

//     // 🔥 Broadcast event to assigned user
//     if ($task->assigned_to) {
//         broadcast(new \App\Events\TaskAssigned($task, $task->assigned_to))->toOthers();
//     }

//     return response()->json([
//         'message' => 'Task created successfully',
//         'task' => $task->load(['project', 'assignee', 'assigner', 'creator']),
//     ]);
// }





    // Store a new task
public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:150',
            'description' => 'nullable|string',
            'status' => ['required', Rule::in(['To Do','In Progress','Under Review','Completed'])],
            'priority' => ['required', Rule::in(['Low','Medium','High','Critical'])],
            'project_id' => 'required|exists:projects,id',
            'assigned_to' => 'nullable|exists:users,id',
            'created_by' => 'required|exists:users,id',
            'due_date' => 'nullable|date',
        ]);

        $data = $request->all();

        // Set assigned_by and assigned_at if assigned
        if (!empty($request->assigned_to)) {
            $data['assigned_by'] = auth()->id();
            $data['assigned_at'] = now();
        }

        // Create the task
        $task = Task::create($data);
        // Insert into TaskHistory
        TaskHistory::create([
            'task_id' => $task->id,
            'user_id' => auth()->id(),          // user who created the task
            'old_status' => null,               // new task, no old status
            'new_status' => $task->status,      // current status
            'changed_at' => now(),
        ]);
        if (!empty($task->assigned_to)) {
    broadcast(new TaskAssigned($task))->toOthers();
}

        return response()->json([
            'message' => 'Task created successfully',
            'task' => $task->load(['project', 'assignee', 'assigner', 'creator']),
        ]);
    }
    /**
     * Update a task and create history log
     */


//     public function update(Request $request, Task $task)
// {
//     $request->validate([
//         'title' => 'sometimes|required|string|max:150',
//         'description' => 'nullable|string',
//         'status' => ['sometimes','required', Rule::in(['To Do','In Progress','Under Review','Completed'])],
//         'priority' => ['sometimes','required', Rule::in(['Low','Medium','High','Critical'])],
//         'project_id' => 'sometimes|required|exists:projects,id',
//         'assigned_to' => 'nullable|exists:users,id',
//         'due_date' => 'nullable|date',
//     ]);

//     $data = $request->all();

//     if ($request->has('assigned_to') && $request->assigned_to != $task->assigned_to) {
//         $data['assigned_by'] = auth()->id();
//         $data['assigned_at'] = now();
//     }

//     $oldStatus = $task->status;
//     $task->update($data);

//     if ($request->has('status') && $oldStatus != $task->status) {
//         TaskHistory::create([
//             'task_id' => $task->id,
//             'user_id' => auth()->id(),
//             'old_status' => $oldStatus,
//             'new_status' => $task->status,
//             'changed_at' => now(),
//         ]);
//     }

//     // 🔥 Broadcast event if reassigned or updated
//     if ($task->assigned_to) {
//         broadcast(new \App\Events\TaskAssigned($task, $task->assigned_to))->toOthers();
//     }

//     return response()->json([
//         'message' => 'Task updated successfully',
//         'task' => $task->load(['project', 'assignee', 'assigner', 'creator']),
//     ]);
// }



    public function update(Request $request, Task $task)
    {
        $request->validate([
            'title' => 'sometimes|required|string|max:150',
            'description' => 'nullable|string',
            'status' => ['sometimes','required', Rule::in(['To Do','In Progress','Under Review','Completed'])],
            'priority' => ['sometimes','required', Rule::in(['Low','Medium','High','Critical'])],
            'project_id' => 'sometimes|required|exists:projects,id',
            'assigned_to' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date',
        ]);
        $data = $request->all();
        // Update assigned_by and assigned_at if assignment changes
        if ($request->has('assigned_to') && $request->assigned_to != $task->assigned_to) {
            $data['assigned_by'] = auth()->id();
            $data['assigned_at'] = now();
        }
        // Track old status before update
        $oldStatus = $task->status;
        // Update the task
        $task->update($data);
        // If status changed, create history log
        if ($request->has('status') && $oldStatus != $task->status) {
            TaskHistory::create([
                'task_id' => $task->id,
                'user_id' => auth()->id(),      // user who updated the task
                'old_status' => $oldStatus,
                'new_status' => $task->status,
                'changed_at' => now(),
            ]);
        }
        return response()->json([
            'message' => 'Task updated successfully',
            'task' => $task->load(['project', 'assignee', 'assigner', 'creator']),
        ]);
    }
    // Delete a task
    public function destroy(Task $task)
    {
        $task->delete();
        return response()->json(['message' => 'Task deleted successfully']);
    }
    // Metadata for dropdowns
    public function metadata()
    {
        $projects = Project::select('id','name')->get();
        $users = User::select('id','name')->get();
        return response()->json(['projects'=>$projects,'users'=>$users]);
    }
}
