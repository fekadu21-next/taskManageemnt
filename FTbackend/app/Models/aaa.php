<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Team;
use Illuminate\Http\Request;

class TeamControler extends Controller
{
    /**
     * GET /api/teams
     * Return all teams with members and user count
     */
public function index()
{
    $teams = Team::select('id', 'name', 'description')->with('users', 'leader')->get();
    return response()->json($teams);
}


    /**
     * POST /api/teams
     * Create a new team
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string'
        ]);

        $team = Team::create($validated);

        return response()->json(
            $team->load(['users.role'])->loadCount('users'),
            201
        );
    }

    /**
     * GET /api/teams/{id}
     * Show one team with members
     */
    public function show($id)
    {
        $team = Team::with(['users.role'])
            ->withCount('users')
            ->findOrFail($id);

        return response()->json($team);
    }

    /**
     * PUT /api/teams/{id}
     * Update team details
     */
    public function update(Request $request, $id)
    {
        $team = Team::findOrFail($id);

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string'
        ]);

        $team->update($validated);

        return response()->json(
            $team->load(['users.role'])->loadCount('users')
        );
    }

    /**
     * DELETE /api/teams/{id}
     * Remove a team
     */
    public function destroy($id)
    {
        $team = Team::findOrFail($id);
        $team->delete();

        return response()->json(['message' => 'Team deleted successfully']);
    }

    /**
     * GET /api/teams/{id}/members
     * Get members of a specific team
     */
    public function members($id, Request $request)
    {
        $team = Team::findOrFail($id);

        $roleName = $request->query('role');

        $query = $team->users()->with('role:id,name');

        if ($roleName) {
            $query->whereHas('role', function ($q) use ($roleName) {
                $q->where('name', $roleName);
            });
        }

        return response()->json($query->get());
    }
}
