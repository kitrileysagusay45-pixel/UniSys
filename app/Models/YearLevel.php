<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class YearLevel extends Model
{
    protected $fillable = [
        'name',
    ];

    public function students()
    {
        return $this->hasMany(Student::class);
    }
}
