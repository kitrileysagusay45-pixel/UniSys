<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Student;
use App\Models\Faculty;
use App\Models\Course;
use App\Models\Subject;
use App\Models\Grade;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Enrollment summary: per-department enrollment counts, section breakdown.
     */
    public function enrollmentSummary(Request $request)
    {
        $academicYear = $request->query('academic_year', '2025-2026');
        $semester     = $request->query('semester', '1st Semester');

        $departments = Department::where('status', '!=', 'Archived')->get();

        $summary = $departments->map(function ($dept) use ($academicYear, $semester) {
            $students = Student::where('department', $dept->name)
                ->where('status', 'Active')
                ->get();

            // Group by section
            $sections = $students->groupBy('section')->map(function ($sectionStudents, $sectionName) {
                return [
                    'section'       => $sectionName ?: 'Unassigned',
                    'student_count' => $sectionStudents->count(),
                    'year_levels'   => $sectionStudents->groupBy('year_level')->map->count(),
                ];
            })->values();

            // Count enrolled subjects for this department's students
            $enrolledCount = DB::table('student_subject')
                ->join('students', 'student_subject.student_id', '=', 'students.id')
                ->where('students.department', $dept->name)
                ->where('students.status', 'Active')
                ->count();

            return [
                'department_code' => $dept->code,
                'department_name' => $dept->name,
                'total_students'  => $students->count(),
                'sections'        => $sections,
                'total_enrolled_subjects' => $enrolledCount,
                'by_year_level'   => $students->groupBy('year_level')->map->count(),
                'by_enrollment_status' => $students->groupBy('enrollment_status')->map->count(),
            ];
        });

        return response()->json([
            'academic_year'    => $academicYear,
            'semester'         => $semester,
            'total_students'   => Student::where('status', 'Active')->count(),
            'total_departments'=> $departments->count(),
            'departments'      => $summary,
        ]);
    }

    /**
     * Department report: faculty count, student count, course count, sections.
     */
    public function departmentReport(Request $request, $code)
    {
        $department = Department::where('code', $code)->first();

        if (!$department) {
            return response()->json(['error' => 'Department not found'], 404);
        }

        $students = Student::where('department', $department->name)
            ->where('status', 'Active')
            ->get();

        $faculties = Faculty::where('department', $department->name)
            ->where('status', 'Active')
            ->get();

        $courses = Course::where('department', $department->name)
            ->where('status', '!=', 'Archived')
            ->get();

        $subjects = Subject::where('department', $department->name)
            ->where('status', 'Active')
            ->with(['faculty', 'room'])
            ->get();

        // Section breakdown
        $sections = $students->groupBy('section')->map(function ($sectionStudents, $sectionName) {
            return [
                'section'       => $sectionName ?: 'Unassigned',
                'student_count' => $sectionStudents->count(),
            ];
        })->values();

        return response()->json([
            'department'      => $department,
            'total_students'  => $students->count(),
            'total_faculties' => $faculties->count(),
            'total_courses'   => $courses->count(),
            'total_subjects'  => $subjects->count(),
            'sections'        => $sections,
            'students'        => $students,
            'faculties'       => $faculties,
            'courses'         => $courses->map(function ($c) {
                return [
                    'id'      => $c->id,
                    'code'    => $c->code,
                    'name'    => $c->name,
                    'type'    => $c->type,
                    'credits' => $c->credits,
                ];
            }),
            'subjects'        => $subjects,
        ]);
    }

    /**
     * Grade report: section-level grade distribution, GWA averages.
     */
    public function gradeReport(Request $request)
    {
        $academicYear = $request->query('academic_year', '2025-2026');
        $semester     = $request->query('semester', '1st Semester');
        $department   = $request->query('department');

        $query = Grade::whereNotNull('final_grade')
            ->where('academic_year', $academicYear)
            ->where('semester', $semester);

        if ($department) {
            $studentIds = Student::where('department', $department)
                ->pluck('id');
            $query->whereIn('student_id', $studentIds);
        }

        $grades = $query->with(['student', 'subject'])->get();

        // Grade distribution
        $distribution = [
            '1.00 - 1.50' => $grades->whereBetween('final_grade', [1.00, 1.50])->count(),
            '1.51 - 2.00' => $grades->whereBetween('final_grade', [1.51, 2.00])->count(),
            '2.01 - 2.50' => $grades->whereBetween('final_grade', [2.01, 2.50])->count(),
            '2.51 - 3.00' => $grades->whereBetween('final_grade', [2.51, 3.00])->count(),
            '3.01 - 5.00' => $grades->where('final_grade', '>', 3.00)->count(),
        ];

        // Remarks summary
        $remarksSummary = [
            'Passed'     => $grades->where('remarks', 'Passed')->count(),
            'Failed'     => $grades->where('remarks', 'Failed')->count(),
            'Incomplete' => $grades->where('remarks', 'Incomplete')->count(),
            'Dropped'    => $grades->where('remarks', 'Dropped')->count(),
        ];

        // Per-section GWA
        $sectionGWAs = $grades->groupBy(function ($grade) {
            return $grade->student->section ?? 'Unassigned';
        })->map(function ($sectionGrades, $section) {
            $avg = $sectionGrades->avg('final_grade');
            return [
                'section'       => $section,
                'average_grade' => round($avg, 4),
                'student_count' => $sectionGrades->pluck('student_id')->unique()->count(),
                'passed'        => $sectionGrades->where('remarks', 'Passed')->count(),
                'failed'        => $sectionGrades->where('remarks', 'Failed')->count(),
            ];
        })->values();

        return response()->json([
            'academic_year'   => $academicYear,
            'semester'        => $semester,
            'department'      => $department ?? 'All',
            'total_grades'    => $grades->count(),
            'overall_average' => $grades->count() > 0 ? round($grades->avg('final_grade'), 4) : null,
            'distribution'    => $distribution,
            'remarks_summary' => $remarksSummary,
            'section_gwa'     => $sectionGWAs,
        ]);
    }
}
