<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;

    protected $table = 'subjects';

    protected $fillable = [
        'code',
        'name',
        'units',
        'section',
        'department',
        'course_id',
        'faculty_id',
        'room_id',
        'room',
        'year_level',
        'schedule_day',
        'schedule_time',
        'time_start',
        'time_end',
        'semester',
        'academic_year',
        'status',
    ];

    protected $casts = [
        'course_id'  => 'integer',
        'faculty_id' => 'integer',
        'room_id'    => 'integer',
        'units'      => 'integer',
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
        return $this->belongsToMany(Student::class, 'student_subject')
                    ->withPivot('semester', 'status', 'faculty_id')
                    ->withTimestamps();
    }
}
