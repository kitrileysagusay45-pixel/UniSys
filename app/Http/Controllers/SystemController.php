<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Setting;
use Illuminate\Http\Request;

class SystemController extends Controller
{
    /**
     * Get recent audit logs
     */
    public function getAuditLogs(Request $request)
    {
        // Sanitize: clamp limit between 1 and 200 to prevent excessive data exposure
        $limit = max(1, min(200, (int) $request->query('limit', 50)));
        $logs = AuditLog::orderBy('created_at', 'desc')->take($limit)->get();
        return response()->json($logs);
    }

    /**
     * Store new audit log
     */
    public function storeAuditLog(Request $request)
    {
        $request->validate([
            'action' => 'required|string',
            'description' => 'nullable|string',
            'user_id' => 'nullable|integer'
        ]);

        $log = AuditLog::create([
            'action' => $request->action,
            'description' => $request->description,
            'user_id' => $request->user_id,
            'ip_address' => $request->ip()
        ]);

        return response()->json($log, 201);
    }

    /**
     * Get all settings mapped by key
     */
    public function getSettings()
    {
        $settings = Setting::all();
        $mapped = [];
        foreach ($settings as $setting) {
            $mapped[$setting->key] = $setting->type === 'json' ? json_decode($setting->value, true) : $setting->value;
        }
        return response()->json($mapped);
    }

    /**
     * Update or create a setting
     */
    public function updateSetting(Request $request)
    {
        $request->validate([
            'key' => 'required|string',
            'value' => 'required',
            'type' => 'nullable|string'
        ]);

        $value = $request->value;
        if (is_array($value) || is_object($value)) {
            $value = json_encode($value);
            $type = 'json';
        } else {
            $type = $request->type ?? 'string';
        }

        $setting = Setting::updateOrCreate(
            ['key' => $request->key],
            ['value' => $value, 'type' => $type]
        );

        return response()->json($setting);
    }
}
