<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Role;

class TeamMemberController extends Controller
{

    public function index(Request $request)
    {
        $user = Auth::user();

        if (!$user || $user->role_id !== 2) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $teamId = $user->team_id;


        $members = User::where('team_id', $teamId)
            ->with(['role:id,name', 'team:id,name'])
            ->get()
            ->map(function ($member) {
                return [
                    'id' => $member->id,
                    'name' => $member->name,
                    'email' => $member->email,
                    'role' => $member->role?->name ?? 'N/A',
                    'team' => $member->team?->name ?? 'N/A',
                    'status' => $member->is_active ? 'Active' : 'Inactive',
                    'profile_photo' => $member->profile_photo,
                ];
            });

        return response()->json([
            'members' => $members,
        ]);
    }

 
    public function roles()
    {
        $roles = Role::select('id', 'name')->pluck('name');
        return response()->json($roles);
    }
}
