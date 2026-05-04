<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'students';

    protected $fillable = [
        'school_id',
        'user_id',
        'program_id',
        'year_level_id',
        'student_id',
        'name',
        'first_name',
        'middle_name',
        'last_name',
        'email',
        'password',
        'date_of_birth',
        'age',
        'sex',
        'phone',
        'address',
        'department',
        'course',
        'year_level',
        'section',
        'photo',
        'status',
        'enrollment_status',
        'rejection_reason',
    ];

    protected $hidden = [
        'password',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function yearLevel()
    {
        return $this->belongsTo(YearLevel::class);
    }

    public function grades()
    {
        return $this->hasMany(Grade::class);
    }

    public function subjects()
    {
        return $this->belongsToMany(Subject::class, 'student_subject');
    }

    public function activityLogs()
    {
        return $this->morphMany(AccountActivityLog::class, 'loggable');
    }

    /**
     * Compute the General Weighted Average (GWA) using credit-weighted computation.
     * Formula: Σ(units × final_grade) / Σ(units)
     *
     * Only considers grades that have a computed final_grade.
     *
     * @param string|null $semester Filter by semester
     * @param string|null $academicYear Filter by academic year
     * @return float|null
     */
    public function getGWA($semester = null, $academicYear = null)
    {
        $query = $this->grades()->whereNotNull('final_grade');

        if ($semester) {
            $query->where('semester', $semester);
        }
        if ($academicYear) {
            $query->where('academic_year', $academicYear);
        }

        $grades = $query->with('subject')->get();

        $totalWeightedGrade = 0;
        $totalUnits = 0;

        foreach ($grades as $grade) {
            $units = $grade->subject ? $grade->subject->units : 3; // Default to 3 units
            $totalWeightedGrade += $units * $grade->final_grade;
            $totalUnits += $units;
        }

        if ($totalUnits === 0) {
            return null;
        }

        return round($totalWeightedGrade / $totalUnits, 4);
    }
}
