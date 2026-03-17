<?php

namespace App\Http\Controllers;

use App\Models\Faculty;
use App\Models\Student;
use App\Models\Course;
use App\Models\Department;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function counts()
    {
        return response()->json([
            'faculties'   => Faculty::where('status', '!=', 'Archived')->count(),
            'students'    => Student::where('status', '!=', 'Archived')->count(),
            'courses'     => Course::where('status', '!=', 'Archived')->count(),
            'departments' => Department::where('status', '!=', 'Archived')->count(),
        ]);
    }
}
