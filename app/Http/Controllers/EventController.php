<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    /**
     * Get upcoming events for the dashboard.
     */
    public function upcoming()
    {
        return response()->json(
            Event::where('event_date', '>=', now()->startOfDay())
                ->orderBy('event_date', 'asc')
                ->limit(5)
                ->get()
        );
    }

    public function index()
    {
        return response()->json(Event::orderBy('event_date', 'asc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required',
            'description' => 'nullable',
            'event_date' => 'required|date',
            'location' => 'nullable',
            'type' => 'required|in:academic,holiday,sports,social',
        ]);

        $event = Event::create($validated);
        return response()->json($event, 201);
    }

    public function show(Event $event)
    {
        return response()->json($event);
    }

    public function update(Request $request, Event $event)
    {
        $validated = $request->validate([
            'title' => 'required',
            'description' => 'nullable',
            'event_date' => 'required|date',
            'location' => 'nullable',
            'type' => 'required|in:academic,holiday,sports,social',
        ]);

        $event->update($validated);
        return response()->json($event);
    }

    public function destroy(Event $event)
    {
        $event->delete();
        return response()->json(null, 204);
    }
}
