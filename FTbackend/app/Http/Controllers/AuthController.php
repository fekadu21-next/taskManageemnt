<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Carbon;
use App\Models\Task;

class AuthController extends Controller
{
public function login(Request $request)
{
    $credentials = $request->validate([
        'email' => 'required|email',
        'password' => 'required|string',
    ]);
    if (!Auth::attempt($credentials)) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }
    $user = Auth::user();
    $now = now();

    // Use last_seen_tasks_at if exists, otherwise fallback to last_logout
    $lastSeen = $user->last_seen_tasks_at ?? $user->last_logout;

    // Get new tasks assigned after lastSeen
    $newTasks = Task::where('assigned_to', $user->id)
        ->when($lastSeen, fn($q) => $q->where('assigned_at', '>', $lastSeen))
        ->get();

    // Update last_login
    $user->last_login = $now;
    $user->save();

    $token = $user->createToken('authToken')->plainTextToken;

    return response()->json([
        'access_token' => $token,
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => strtolower(optional($user->role)->name ?? ''),
            'profile_photo' => $user->profile_photo,
            'team_id' => $user->team_id,
            'last_login' => $user->last_login,
            'last_logout' => $user->last_logout,
            'last_seen_tasks_at' => $user->last_seen_tasks_at,
        ],
        'new_tasks_count' => $newTasks->count(),
        'new_tasks' => $newTasks,
    ]);
}


public function logout(Request $request)
{
    $user = $request->user();

    $user->last_logout = now();
    $user->save();

    $user->tokens()->delete();

    return response()->json(['message' => 'Successfully logged out']);
}



    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => strtolower(optional($user->role)->name ?? ''),
            'profile_photo' => $user->profile_photo,
            'team_id' => $user->team_id,
            'last_login' => $user->last_login,
        ]);
    }
}
