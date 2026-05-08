<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    protected $fillable = ['name', 'description', 'leader_id']; // ✅ include leader_id

    /**
     * All users in the team
     */
    public function users()
    {
        return $this->hasMany(User::class, 'team_id')->with('role');
    }

    /**
     * The assigned leader of the team (via leader_id column)
     */
    public function leader()
    {
        return $this->belongsTo(User::class, 'leader_id')->with('role');
    }
}
