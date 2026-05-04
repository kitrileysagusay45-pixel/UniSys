<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Faculty;
use App\Models\Student;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    /**
     * Get announcements for the dashboard — role-aware filtering.
     */
    public function dashboard(Request $request)
    {
        $user = $request->_verified_user ?? $request->user();
        $role = $user->role ?? 'student';

        $query = Announcement::active()
            ->orderBy('created_at', 'desc')
            ->limit(10);

        if ($role === 'student') {
            $student = Student::where('user_id', $user->id)->first()
                    ?? Student::where('email', $user->email)->first();

            if ($student) {
                $query->where(function ($q) use ($student, $role) {
                    $q->where(function ($inner) use ($role) {
                        $inner->where('target_role', 'all')
                              ->orWhere('target_role', $role);
                    })->where(function ($inner) use ($student) {
                        $inner->forSection($student->section)
                              ->forDepartment($student->department);
                    });
                });
            }
        } elseif ($role === 'faculty') {
            $query->where(function ($q) use ($role) {
                $q->where('target_role', 'all')
                  ->orWhere('target_role', $role);
            });
        }
        // admin sees all

        return response()->json($query->with('faculty')->get());
    }

    /**
     * List all announcements (Admin).
     */
    public function index()
    {
        return response()->json(
            Announcement::with('faculty')
                ->orderBy('created_at', 'desc')
                ->get()
        );
    }

    /**
     * Store a new announcement.
     * Faculty can post to their assigned sections. Admin can post to any.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'content'     => 'required|string',
            'type'        => 'required|in:info,urgent,success,warning,holiday',
            'category'    => 'nullable|in:exam_schedule,activity_notice,requirement_reminder,general_advisory',
            'target_role' => 'required|in:all,admin,faculty,student',
            'section'     => 'nullable|string|max:20',
            'department'  => 'nullable|string|max:100',
            'faculty_id'  => 'nullable|exists:faculties,id',
            'expiry_date' => 'nullable|date',
        ]);

        $validated['category'] = $validated['category'] ?? 'general_advisory';

        $announcement = Announcement::create($validated);
        return response()->json($announcement->load('faculty'), 201);
    }

    /**
     * Show a specific announcement.
     */
    public function show(Announcement $announcement)
    {
        return response()->json($announcement->load('faculty'));
    }

    /**
     * Update an announcement.
     */
    public function update(Request $request, Announcement $announcement)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'content'     => 'required|string',
            'type'        => 'required|in:info,urgent,success,warning,holiday',
            'category'    => 'nullable|in:exam_schedule,activity_notice,requirement_reminder,general_advisory',
            'target_role' => 'required|in:all,admin,faculty,student',
            'section'     => 'nullable|string|max:20',
            'department'  => 'nullable|string|max:100',
            'faculty_id'  => 'nullable|exists:faculties,id',
            'expiry_date' => 'nullable|date',
        ]);

        $announcement->update($validated);
        return response()->json($announcement->load('faculty'));
    }

    /**
     * Delete an announcement.
     */
    public function destroy(Announcement $announcement)
    {
        $announcement->delete();
        return response()->json(null, 204);
    }

    /**
     * Faculty: Get announcements posted by the logged-in faculty.
     */
    public function facultyAnnouncements(Request $request)
    {
        $user = $request->_verified_user ?? $request->user();
        $faculty = Faculty::where('user_id', $user->id)->first()
                ?? Faculty::where('email', $user->email)->first();

        if (!$faculty) {
            return response()->json(['error' => 'Faculty record not found'], 404);
        }

        $announcements = Announcement::where('faculty_id', $faculty->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($announcements);
    }

    /**
     * Student: Get announcements for the student's section and department.
     */
    public function sectionAnnouncements(Request $request)
    {
        $user = $request->_verified_user ?? $request->user();
        $student = Student::where('user_id', $user->id)->first()
                ?? Student::where('email', $user->email)->first();

        if (!$student) {
            return response()->json(['error' => 'Student record not found'], 404);
        }

        $announcements = Announcement::active()
            ->where(function ($q) {
                $q->where('target_role', 'all')
                  ->orWhere('target_role', 'student');
            })
            ->forSection($student->section)
            ->forDepartment($student->department)
            ->with('faculty')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($announcements);
    }
}
