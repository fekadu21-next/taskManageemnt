<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\UserControler;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\TeamController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\TeamMemberController;
use App\Http\Controllers\Api\DevtaskController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\PerformanceController;
use App\Http\Controllers\Api\TaskHistoryController;
use App\Http\Controllers\Api\DashboardController;
// use App\Http\Controllers\Api\AuthControler;

// Public endpoints (no middleware)
// Route::post('/resetpassword', [AuthControler::class, 'resetPasswordConfirm']);

// ---------- AUTH ----------
// Route::post('/login',  [AuthController::class, 'login']);
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/reset-password', [UserControler::class, 'handleReset']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/me',      [AuthController::class, 'me'])->middleware('auth:sanctum');

// ---------- PROFILE ----------
Route::middleware('auth:sanctum')->post('/user/update-profile', [UserController::class, 'updateProfile']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/team-members', [TeamMemberController::class, 'index']);
    Route::get('/roles', [TeamMemberController::class, 'roles']);
});
// ---------- PROTECTED (Manager) ----------
Route::middleware('auth:sanctum')->group(function () {
    // Users CRUD
    Route::get('/users',                [UserControler::class, 'index']);
    Route::get('/userr',                [UserControler::class, 'indexx']);
    Route::post('/users',               [UserControler::class, 'store']);
    Route::put('/users/{id}',           [UserControler::class, 'update']);
    Route::delete('/users/{id}',        [UserControler::class, 'destroy']);
    Route::patch('/users/{id}/toggle-active', [UserControler::class, 'toggleActive']);
    Route::post('/users/{id}/reset-password', [UserControler::class, 'resetPassword']);
    // Route::post('/reset-password', [UserControler::class, 'handleReset']);
    Route::get('/Devtasks', [DevtaskController::class, 'getDeveloperTasks']);
    
    Route::get('/summary', [DevtaskController::class, 'summary']);

    Route::get('/performance', [PerformanceController::class, 'performance']);

    Route::post('/mark-seen', [DevtaskController::class, 'markTasksSeen']);
    Route::get('/comments/all', [CommentController::class, 'allComments']);
    // Create a new comment for a task
    Route::post('/tasks/{taskId}/comments', [CommentController::class, 'store']);
    // Delete a comment
    Route::delete('/comments/{id}', [CommentController::class, 'destroy']);
    // Download attachment
    Route::get('/attachments/{id}/download', [CommentController::class, 'downloadAttachment']);
    Route::get('/comments/new', [CommentController::class, 'newComments']);
    Route::post('/comments/mark-seen', [CommentController::class, 'markCommentsSeen']);

    Route::get('/task-histories', [TaskHistoryController::class, 'index']);
    Route::get('/task-history', [TaskHistoryController::class, 'indexx']);
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboardma', [DashboardController::class, 'indexx']);
    Route::get('/teams', [TeamController::class, 'index']);
    Route::post('/teams', [TeamController::class, 'store']);
    Route::get('/teams/{id}', [TeamController::class, 'show']);
    Route::put('/teams/{id}', [TeamController::class, 'update']);
    Route::delete('/teams/{id}', [TeamController::class, 'destroy']);
    Route::get('/teams/{id}/members', [TeamController::class, 'members']);

    Route::apiResource('projects', ProjectController::class);
    Route::get('/projectts', [ProjectController::class, 'indexx']);
    Route::put('/projectts/{id}', [ProjectController::class, 'updatee']);
    
    Route::get('/tasks', [TaskController::class, 'index']); // List tasks with filters
    Route::get('/taskks', [TaskController::class, 'indexx']);
    Route::post('/tasks', [TaskController::class, 'store']); // Create task
    Route::put('/tasks/{task}', [TaskController::class, 'update']); // Update task
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);
    Route::get('/tasks/metadata', [TaskController::class, 'metadata']);
     Route::get('/tasks/projectProgress', [TaskController::class, 'projectProgress']);
        // Roles & Teams for dropdowns
    Route::get('/roles', [RoleController::class, 'index']);
    // Route::get('/teams', [TeamController::class, 'index']);
});


