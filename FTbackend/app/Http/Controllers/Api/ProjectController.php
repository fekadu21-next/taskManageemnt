<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProjectController extends Controller
{
    // List all projects
    public function index()
    {
        $projects = Project::with('team', 'creator')->get();
        return response()->json($projects);
    }
public function indexx() {
    $user = Auth::user(); 
    // Ensure only team leaders see their team projects 
    if ($user->role_id === 2 && $user->team_id) { 
        $projects = Project::with(['team', 'creator']) 
            ->where('team_id', $user->team_id) 
            ->get(); 
    } else { 
        // Optionally, admins or other roles can see all projects 
        $projects = Project::with(['team', 'creator'])->get(); 
    } 
    return response()->json([ 
        'success' => true, 
        'projects' => $projects 
    ]); 
}


public function updatee(Request $request, $id)
{
    // Validate incoming request
    $request->validate([
        'status' => 'required|string|in:Pending,In Progress,Completed',
    ]);

    $project = Project::findOrFail($id);

    // Update the status
    $project->status = $request->status;

    // Optionally, recalculate progress based on tasks
    // Example: if you have a tasks() relationship
    if ($project->tasks()->exists()) {
        $totalTasks = $project->tasks()->count();
        $completedTasks = $project->tasks()->where('status', 'Completed')->count();
        $project->progress = round(($completedTasks / $totalTasks) * 100);
    } else {
        $project->progress = 0; // no tasks yet
    }

    $project->save();

    // Reload project with relationships to return full data
    $project = Project::with('team', 'creator')->find($project->id);

    return response()->json([
        'success' => true,
        'project' => $project
    ]);
}
    // Store a new project
//   use Illuminate\Support\Facades\Auth; // ✅ make sure this is at the top

public function store(Request $request)
{
    // ✅ Validate request data
    $validated = $request->validate([
        'name' => 'required|string|max:100',
        'description' => 'nullable|string',
        'team_id' => 'nullable|exists:teams,id',
        'start_date' => 'required|date',
        'end_date' => 'required|date',
        'status' => 'nullable|in:Pending,In Progress,Completed',
    ]);

    // ✅ Automatically assign the current logged-in user
    $validated['created_by'] = Auth::id();

    // ✅ Create the project safely using validated data
    $project = Project::create($validated);

    // ✅ Return a clear JSON response
    return response()->json([
        'message' => 'Project created successfully',
        'project' => $project,
    ], 201);
}

    // Show a single project
    public function show(Project $project)
    {
        $project->load('team', 'creator');
        return response()->json($project);
    }

    // Update a project
    public function update(Request $request, Project $project)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'team_id' => 'nullable|exists:teams,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'progress' => 'nullable|integer|min:0|max:100',
            'status' => 'nullable|in:Pending,In Progress,Completed'
        ]);

        $project->update($request->all());

        return response()->json($project);
    }
    // Delete a project
    public function destroy(Project $project)
    {
        $project->delete();
        return response()->json(['message' => 'Project deleted successfully']);
    }
}
