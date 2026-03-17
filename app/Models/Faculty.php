<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Faculty extends Model
{
    use HasFactory;

    // Table name (optional if Laravel pluralizes correctly)
    protected $table = 'faculties';

    // Allow mass assignment for these fields (only those in fill-up form)
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
        'phone',
        'address',
        'position',
        'employment_type',
        'date_hired',
        'office_phone',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function grades()
    {
        return $this->hasMany(Grade::class);
    }
}
