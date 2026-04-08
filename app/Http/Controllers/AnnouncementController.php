<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    /**
     * Get announcements for the dashboard.
     */
    public function dashboard(Request $request)
    {
        $role = $request->user()->isAdmin() ? 'admin' : ($request->user()->isFaculty() ? 'faculty' : 'student');
        
        return response()->json(
            Announcement::where(function($q) use ($role) {
                $q->where('target_role', 'all')
                  ->orWhere('target_role', $role);
            })
            ->where(function($q) {
                $q->whereNull('expiry_date')
                  ->orWhere('expiry_date', '>', now());
            })
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
        );
    }

    public function index()
    {
        return response()->json(Announcement::orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required',
            'content' => 'required',
            'type' => 'required|in:info,urgent,success,warning',
            'target_role' => 'required|in:all,admin,faculty,student',
            'expiry_date' => 'nullable|date',
        ]);

        $announcement = Announcement::create($validated);
        return response()->json($announcement, 201);
    }

    public function show(Announcement $announcement)
    {
        return response()->json($announcement);
    }

    public function update(Request $request, Announcement $announcement)
    {
        $validated = $request->validate([
            'title' => 'required',
            'content' => 'required',
            'type' => 'required|in:info,urgent,success,warning',
            'target_role' => 'required|in:all,admin,faculty,student',
            'expiry_date' => 'nullable|date',
        ]);

        $announcement->update($validated);
        return response()->json($announcement);
    }

    public function destroy(Announcement $announcement)
    {
        $announcement->delete();
        return response()->json(null, 204);
    }
}
