<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Faculty extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'faculties';

    protected $fillable = [
        'school_id',
        'user_id',
        'department_id',
        'faculty_id',
        'employee_id',
        'first_name',
        'middle_name',
        'last_name',
        'date_of_birth',
        'age',
        'sex',
        'email',
        'password',
        'phone',
        'address',
        'department',
        'tin_number',
        'position',
        'employment_type',
        'date_hired',
        'office_phone',
        'status',
        'specialization',
        'subject_assignment',
        'rejection_reason',
    ];

    protected $hidden = [
        'password',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function departmentRecord()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    public function grades()
    {
        return $this->hasMany(Grade::class);
    }

    public function subjects()
    {
        return $this->hasMany(Subject::class);
    }

    public function activityLogs()
    {
        return $this->morphMany(AccountActivityLog::class, 'loggable');
    }
}
