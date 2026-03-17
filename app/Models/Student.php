<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

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
        'date_of_birth',
        'age',
        'sex',
        'phone',
        'address',
        'department',
        'course',
        'status',
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
}
