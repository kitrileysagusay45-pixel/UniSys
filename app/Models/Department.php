<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    protected $table = 'departments';

    protected $fillable = [
        'code',
        'name',
        'head',
        'status',
    ];

    public function programs()
    {
        return $this->hasMany(Program::class);
    }

    public function faculties()
    {
        return $this->hasMany(Faculty::class);
    }
}
