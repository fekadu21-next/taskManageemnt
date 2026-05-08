<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UserControler extends Controller
{
    /** Return an array shaped for the frontend */
    private function formatUser(User $user): array
    {
        $user->loadMissing(['role:id,name', 'team:id,name']);

        // If your User accessor already returns full URL for profile_photo, this will be that URL.
        $photo = $user->profile_photo;
        if ($photo && !Str::startsWith($photo, ['http://', 'https://'])) {
            $photo = url('storage/' . ltrim($photo, '/'));
        }
        return [
            'id'          => $user->id,
            'name'        => $user->name,
            'email'       => $user->email,
            'role'        => $user->role ? ['id' => $user->role->id, 'name' => $user->role->name] : null,
            'team'        => $user->team ? ['id' => $user->team->id, 'name' => $user->team->name] : null,
            'last_login'  => $user->last_login,
            'status'      => (bool) $user->is_active,
            'profile_photo' => $photo,
        ];
    }

    /** GET /api/users */
    public function index()
    {
        $users = User::with(['role:id,name', 'team:id,name'])->get();
        return response()->json($users->map(fn ($u) => $this->formatUser($u)));
    }
    public function indexx()
{
    // Get only users with role_id = 2 (leaders), with role and team info
    $users = User::with(['role:id,name', 'team:id,name'])
                 ->where('role_id', 2)
                 ->get();

    // Optionally format each user if you have a formatUser function
    return response()->json($users->map(fn($u) => $this->formatUser($u)));
}


    /** POST /api/users  (create) */
public function store(Request $request)
{
    $validated = $request->validate([
        'name'    => ['required', 'string', 'max:255'],
        'email'   => ['required', 'email', 'max:255', 'unique:users,email'],
        'role_id' => ['required', Rule::exists('roles', 'id')],
        'team_id' => ['nullable', Rule::exists('teams', 'id')],
        'password'=> ['required', 'string'], // add password validation
        'profile_photo' => ['nullable', 'image', 'max:2048'],
    ]);

    $user = new User();
    $user->name      = $validated['name'];
    $user->email     = $validated['email'];
    $user->role_id   = $validated['role_id'];
    $user->team_id   = $validated['team_id'] ?? null;
    $user->password  = Hash::make($validated['password']); // hash the input password
    $user->is_active = true;

    if ($request->hasFile('profile_photo')) {
        $user->profile_photo = $request->file('profile_photo')->store('profile_photos', 'public');
    }

    $user->save();

    $payload = [
        'message' => 'User created successfully',
        'user'    => $this->formatUser($user),
    ];

    return response()->json($payload, 201);
}
    /** PUT /api/users/{id} (update basic info) */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name'    => ['required', 'string', 'max:255'],
            'email'   => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role_id' => ['required', Rule::exists('roles', 'id')],
            'team_id' => ['nullable', Rule::exists('teams', 'id')],
            'profile_photo' => ['nullable', 'image', 'max:2048'],
        ]);

        $user->name    = $validated['name'];
        $user->email   = $validated['email'];
        $user->role_id = $validated['role_id'];
        $user->team_id = $validated['team_id'] ?? null;

        if ($request->hasFile('profile_photo')) {
            if ($user->profile_photo) {
                Storage::disk('public')->delete($user->profile_photo);
            }
            $user->profile_photo = $request->file('profile_photo')->store('profile_photos', 'public');
        }

        $user->save();

        return response()->json([
            'message' => 'User updated successfully',
            'user'    => $this->formatUser($user),
        ]);
    }

    /** DELETE /api/users/{id} */
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        if ($user->profile_photo) {
            Storage::disk('public')->delete($user->profile_photo);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    /** PATCH /api/users/{id}/toggle-active */
    public function toggleActive($id)
    {
        $user = User::findOrFail($id);
        $user->is_active = !$user->is_active;
        $user->save();

        return response()->json([
            'message'   => $user->is_active ? 'User activated' : 'User deactivated',
            'is_active' => (bool) $user->is_active,
            'user'      => $this->formatUser($user),
        ]);
    }

    /** POST /api/users/{id}/reset-password */
public function resetPassword(Request $request, User $user)
{
    $status = Password::sendResetLink([
        'email' => $request->email, // 👈 get email from request body
    ]);

    if ($status === Password::RESET_LINK_SENT) {
        return response()->json([
            'message' => 'Password reset link sent successfully.'
        ]);
    } else {
        return response()->json([
            'message' => 'Failed to send reset link.'
        ], 500);
    }
}
public function handleReset(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:6|confirmed',
        ]);
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();
            }
        );
        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Password reset successfully.']);
        } else {
            return response()->json(['message' => __($status)], 500);
        }
    }
}
