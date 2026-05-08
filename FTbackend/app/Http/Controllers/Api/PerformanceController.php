<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Task;
use Carbon\Carbon;

class PerformanceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
public function performance()
{
    $userId = auth()->id();

    // Fetch all tasks assigned to this user
    $tasks = Task::where('assigned_to', $userId)->get();

    $totalTasks = $tasks->count();
    $completedTasks = $tasks->where('status', 'Completed')->count();
    $overdueTasks = $tasks->filter(function($t) {
        return $t->status !== 'Completed' && $t->due_date < now();
    })->count();
    $onTimeTasks = $tasks->filter(function($t) {
        return $t->status === 'Completed' && $t->updated_at <= $t->due_date;
    })->count();



$avgCompletionTime = $tasks->filter(fn($t) => $t->status === 'Completed' && $t->updated_at)
    ->map(fn($t) => max(0, Carbon::parse($t->updated_at)->floatDiffInHours(Carbon::parse($t->assigned_at))) / 24)
    ->avg();





    // Weekly trend based on completed vs overdue
 $trend = [];
$weekCount = 4;

for ($i = $weekCount - 1; $i >= 0; $i--) {
    // Start of week (Monday) i weeks ago
    $start = now()->startOfWeek()->subWeeks($i)->startOfDay();
    $end = $start->copy()->endOfWeek()->endOfDay(); // Sunday

    // Tasks that overlap with this week
    $weekTasks = $tasks->filter(fn($t) => $t->created_at <= $end && $t->due_date >= $start);

    // Completed tasks
    $completed = $weekTasks->where('status', 'Completed')->count();

    // Overdue tasks (not completed and due date passed)
    $overdue = $weekTasks->filter(fn($t) => $t->status !== 'Completed' && $t->due_date < now())->count();

    $trend[] = [
        'period' => $start->format('M d') . ' - ' . $end->format('M d'),
        'completed' => $completed,
        'overdue' => $overdue
    ];
}
return response()->json([
    'tasks' => $tasks->map(function($t) {
        return [
            'id' => $t->id,
            'title' => $t->title,
            'status' => $t->status,
            'due_date' => $t->due_date,
            'assigned_at' => $t->assigned_at,
            'updated_at' => $t->updated_at, // use this as completed time
        ];
    }),
    'totalTasks' => $totalTasks,
    'completedTasks' => $completedTasks,
    'overdueTasks' => $overdueTasks,
    'onTimeTasks' => $onTimeTasks,
    'avgCompletionTime' => round($avgCompletionTime, 1),
    'trend' => $trend
]);

}


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
