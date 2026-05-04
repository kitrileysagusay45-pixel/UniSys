<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'units',
        'department',
        'section',
        'course_id',
        'faculty_id',
        'room_id',
        'schedule_day',
        'schedule_time',
        'time_start',
        'time_end',
        'semester',
        'academic_year',
        'status',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function faculty()
    {
        return $this->belongsTo(Faculty::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function students()
    {
        return $this->belongsToMany(Student::class, 'student_subject');
    }

    public function grades()
    {
        return $this->hasMany(Grade::class);
    }

    /**
     * Check for schedule conflicts with other subjects.
     * A conflict exists when another subject uses the same room on the same day
     * with overlapping time ranges.
     */
    public static function findConflicts($roomId, $scheduleDay, $timeStart, $timeEnd, $excludeId = null)
    {
        if (!$roomId || !$scheduleDay || !$timeStart || !$timeEnd) {
            return collect();
        }

        $query = static::where('room_id', $roomId)
            ->where('schedule_day', $scheduleDay)
            ->where('status', 'Active')
            ->where(function ($q) use ($timeStart, $timeEnd) {
                // Overlapping: existing.start < new.end AND existing.end > new.start
                $q->where('time_start', '<', $timeEnd)
                  ->where('time_end', '>', $timeStart);
            });

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->get();
    }
}
