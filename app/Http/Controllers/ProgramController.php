<?php

namespace App\Http\Controllers;

use App\Models\Program;
use Illuminate\Http\Request;

class ProgramController extends Controller
{
    public function index()
    {
        return response()->json(Program::with('department')->get());
    }

    public function publicList()
    {
        return response()->json(Program::select('id', 'code', 'name')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|unique:programs,code',
            'name' => 'required',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        $program = Program::create($validated);
        return response()->json($program, 201);
    }

    public function show(Program $program)
    {
        return response()->json($program->load('department'));
    }

    public function update(Request $request, Program $program)
    {
        $validated = $request->validate([
            'code' => 'required|unique:programs,code,' . $program->id,
            'name' => 'required',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        $program->update($validated);
        return response()->json($program);
    }

    public function destroy(Program $program)
    {
        $program->delete();
        return response()->json(null, 204);
    }
}
