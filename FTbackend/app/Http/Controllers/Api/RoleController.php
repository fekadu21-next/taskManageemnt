<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;

class RoleController extends Controller
{
    /** GET /api/roles */
    public function index()
    {
        return Role::select('id', 'name')->orderBy('name')->get();
    }
}
