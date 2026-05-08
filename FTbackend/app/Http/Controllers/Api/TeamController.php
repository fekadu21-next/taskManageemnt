<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Team;
use Illuminate\Http\Request;
class TeamController extends Controller
{
    // GET /api/teams
public function index()
{
    $teams = Team::with(['leader', 'users.role'])->get();

    // Map teams and include only developer members (role_id = 3)
    $teams = $teams->map(function ($team) {
        return [
            'id' => $team->id,
            'name' => $team->name,
            'description' => $team->description,
            // Return leader name directly
            'leader' => $team->leader ? $team->leader->name : null,
            'leader_id' => $team->leader ? $team->leader->id : null, // keep ID if needed for editing
            'members' => $team->users->filter(fn($u) => $u->role && $u->role->id === 3)
                                     ->map(fn($u) => [
                                         'id' => $u->id,
                                         'name' => $u->name,
                                         'email' => $u->email
                                     ])
                                     ->values()
        ];
    });

    return response()->json($teams);
}


    // POST /api/teams
public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'leader_id' => 'nullable|exists:users,id',
    ]);

    $team = Team::create($validated);

    // Reload relationships
    $team->load(['leader', 'users.role']);

    // Format leader as name, members filtered as before
    $formatted = [
        'id' => $team->id,
        'name' => $team->name,
        'description' => $team->description,
        'leader' => $team->leader ? $team->leader->name : null,
        'leader_id' => $team->leader ? $team->leader->id : null,
        'members' => $team->users->filter(fn($u) => $u->role && $u->role->id === 3)
                          ->map(fn($u) => [
                              'id' => $u->id,
                              'name' => $u->name,
                              'email' => $u->email,
                          ])
                          ->values()
    ];

    return response()->json($formatted, 201);
}



    // GET /api/teams/{id}
    public function show($id)
    {
        $team = Team::with(['users.role', 'leader.role'])->findOrFail($id);
        return response()->json($team);
    }

    // PUT /api/teams/{id}
public function update(Request $request, $id)
{
    $team = Team::findOrFail($id);

    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'leader_id' => 'nullable|exists:users,id',
    ]);

    $team->update($validated);

    $team->load(['leader', 'users.role']);

    $formatted = [
        'id' => $team->id,
        'name' => $team->name,
        'description' => $team->description,
        'leader' => $team->leader ? $team->leader->name : null,
        'leader_id' => $team->leader ? $team->leader->id : null,
        'members' => $team->users->filter(fn($u) => $u->role && $u->role->id === 3)
                          ->map(fn($u) => [
                              'id' => $u->id,
                              'name' => $u->name,
                              'email' => $u->email,
                          ])
                          ->values()
    ];

    return response()->json($formatted);
}



    // DELETE /api/teams/{id}
    public function destroy($id)
    {
        $team = Team::findOrFail($id);
        $team->delete();

        return response()->json(['message' => 'Team deleted successfully']);
    }

    // GET /api/teams/{id}/members
 public function members($id)
    {
        $team = Team::with(['users.role'])->findOrFail($id);

        $members = $team->users->filter(fn($u) => $u->role && $u->role->id === 3)
                                ->map(fn($u) => [
                                    'id' => $u->id,
                                    'name' => $u->name,
                                    'email' => $u->email,
                                ])
                                ->values();

        return response()->json($members);
    }
}
