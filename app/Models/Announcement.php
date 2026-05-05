<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    use HasFactory;

    protected $fillable = [
        'faculty_id',
        'subject_id',
        'title',
        'content',
        'type',
        'category',
        'target_role',
        'section',
        'department',
        'expiry_date',
    ];

    protected $casts = [
        'expiry_date' => 'datetime',
    ];

    /**
     * Valid announcement categories.
     */
    public const CATEGORIES = [
        'exam_schedule',
        'activity_notice',
        'requirement_reminder',
        'general_advisory',
    ];

    /**
     * The faculty member who posted this announcement.
     */
    public function faculty()
    {
        return $this->belongsTo(Faculty::class);
    }

    /**
     * Scope to filter announcements for a specific section.
     */
    public function scopeForSection($query, $section)
    {
        return $query->where(function ($q) use ($section) {
            $q->where('section', $section)
              ->orWhereNull('section');
        });
    }

    /**
     * Scope to filter announcements for a specific department.
     */
    public function scopeForDepartment($query, $department)
    {
        return $query->where(function ($q) use ($department) {
            $q->where('department', $department)
              ->orWhereNull('department');
        });
    }

    /**
     * The subject this announcement is targeted to.
     */
    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * Scope to filter announcements for a specific subject.
     */
    public function scopeForSubject($query, $subjectId)
    {
        return $query->where(function ($q) use ($subjectId) {
            $q->where('subject_id', $subjectId)
              ->orWhereNull('subject_id');
        });
    }

    /**
     * Scope to filter only active (non-expired) announcements.
     */
    public function scopeActive($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('expiry_date')
              ->orWhere('expiry_date', '>', now());
        });
    }
}
