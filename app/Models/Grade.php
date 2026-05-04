<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Grade extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'course_id',
        'subject_id',
        'faculty_id',
        'room_id',
        'grade',
        'prelim',
        'midterm',
        'finals',
        'final_grade',
        'grading_period',
        'remarks',
        'semester',
        'academic_year',
    ];

    protected $casts = [
        'grade'       => 'decimal:2',
        'prelim'      => 'decimal:2',
        'midterm'     => 'decimal:2',
        'finals'      => 'decimal:2',
        'final_grade' => 'decimal:2',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function faculty()
    {
        return $this->belongsTo(Faculty::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    /**
     * Compute the final grade as the average of prelim, midterm, and finals.
     * Only computes when all three periods have grades.
     */
    public function computeFinalGrade()
    {
        if ($this->prelim !== null && $this->midterm !== null && $this->finals !== null) {
            $this->final_grade = round(($this->prelim + $this->midterm + $this->finals) / 3, 2);
            $this->grade = $this->final_grade; // Keep legacy column in sync
            $this->remarks = $this->computeRemarks();
            return $this->final_grade;
        }

        return null;
    }

    /**
     * Compute remarks based on the final grade.
     * Passed: ≤ 3.0, Failed: > 3.0, Incomplete: missing period, Dropped: manual
     */
    public function computeRemarks()
    {
        if ($this->remarks === 'Dropped') {
            return 'Dropped';
        }

        if ($this->prelim === null || $this->midterm === null || $this->finals === null) {
            return 'Incomplete';
        }

        $grade = $this->final_grade ?? $this->grade;

        if ($grade === null) {
            return 'Incomplete';
        }

        return $grade <= 3.0 ? 'Passed' : 'Failed';
    }
}
