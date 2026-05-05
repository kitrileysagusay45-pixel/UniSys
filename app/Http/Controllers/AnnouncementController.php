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
                $enrolledSubjectIds = \DB::table('student_subject')
                    ->where('student_id', $student->id)
                    ->pluck('subject_id');

                $query->where(function ($q) use ($student, $role, $enrolledSubjectIds) {
                    $q->where(function ($inner) use ($role) {
                        $inner->where('target_role', 'all')
                              ->orWhere('target_role', $role);
                    })->where(function ($inner) use ($student, $enrolledSubjectIds) {
                        $inner->where(function($sub) use ($student) {
                            $sub->forSection($student->section)
                                ->forDepartment($student->department);
                        })->orWhereIn('subject_id', $enrolledSubjectIds);
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

        return response()->json($query->with(['faculty', 'subject'])->get());
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
            'subject_id'  => 'nullable|exists:subjects,id',
            'section'     => 'nullable|string|max:20',
            'department'  => 'nullable|string|max:100',
            'faculty_id'  => 'nullable|exists:faculties,id',
            'expiry_date' => 'nullable|date',
        ]);

        $validated['category'] = $validated['category'] ?? 'general_advisory';

        $announcement = Announcement::create($validated);

        // --- Notification Logic ---
        $targetRole = $announcement->target_role;
        $title = $announcement->title;
        $message = \Illuminate\Support\Str::limit($announcement->content, 150);
        $icon = 'bell';

        $usersToNotify = collect();

        if ($targetRole === 'all') {
            $usersToNotify = \App\Models\User::all();
        } elseif ($targetRole === 'admin') {
            $usersToNotify = \App\Models\User::where('role', 'admin')->get();
        } elseif ($targetRole === 'faculty') {
            $usersToNotify = \App\Models\User::where('role', 'faculty')->get();
        } elseif ($targetRole === 'student') {
            if ($announcement->subject_id) {
                // Targeted to students enrolled in this specific subject
                $studentIds = \DB::table('student_subject')
                    ->where('subject_id', $announcement->subject_id)
                    ->pluck('student_id');
                
                $userIds = \App\Models\Student::whereIn('id', $studentIds)->pluck('user_id');
                $usersToNotify = \App\Models\User::whereIn('id', $userIds)->get();
            } else {
                $studentQuery = \App\Models\Student::where('status', 'Active');
                
                if ($announcement->department) {
                    $studentQuery->where('department', $announcement->department);
                }
                if ($announcement->section) {
                    $studentQuery->where('section', $announcement->section);
                }
                
                $userIds = $studentQuery->pluck('user_id');
                $usersToNotify = \App\Models\User::whereIn('id', $userIds)->get();
            }
        }

        // Bulk insert notifications
        $notificationsData = [];
        $now = now();
        foreach ($usersToNotify as $u) {
            $notificationsData[] = [
                'user_id' => $u->id,
                'title' => $title,
                'message' => $message,
                'type' => $announcement->type,
                'icon' => 'bell',
                'action_link' => '/student-subjects', // Or appropriate link
                'is_read' => false,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        foreach (array_chunk($notificationsData, 500) as $chunk) {
            \App\Models\Notification::insert($chunk);
        }
        // --------------------------

        return response()->json($announcement->load(['faculty', 'subject']), 201);
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

        $enrolledSubjectIds = \DB::table('student_subject')
            ->where('student_id', $student->id)
            ->pluck('subject_id');

        $announcements = Announcement::active()
            ->where(function ($q) use ($student, $enrolledSubjectIds) {
                $q->where(function($general) use ($student) {
                    $general->where('target_role', 'all')
                            ->orWhere('target_role', 'student')
                            ->where(function($loc) use ($student) {
                                $loc->forSection($student->section)
                                    ->forDepartment($student->department);
                            });
                })->orWhereIn('subject_id', $enrolledSubjectIds);
            })
            ->with(['faculty', 'subject'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($announcements);
    }
}
