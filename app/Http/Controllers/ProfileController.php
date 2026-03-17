<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function index()
    {
        return Profile::all(); // GET all profiles
    }

    public function store(Request $request)
    {
        $profile = Profile::create($request->all());
        return response()->json($profile, 201);
    }

    public function show(Profile $profile)
    {
        return $profile;
    }

    public function update(Request $request, Profile $profile)
    {
        $profile->update($request->all());
        return response()->json($profile, 200);
    }

    public function destroy(Profile $profile)
    {
        $profile->delete();
        return response()->json(null, 204);
    }
}
