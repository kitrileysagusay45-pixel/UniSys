<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $table = 'courses';

    protected $fillable = [
        'code',
        'name',
        'type',
        'department',
        'credits',
        'status',
    ];

    /**
     * Valid course types.
     */
    public const TYPES = ['lecture', 'laboratory', 'clinical', 'capstone'];

    public function grades()
    {
        return $this->hasMany(Grade::class);
    }

    public function subjects()
    {
        return $this->hasMany(Subject::class);
    }
}
