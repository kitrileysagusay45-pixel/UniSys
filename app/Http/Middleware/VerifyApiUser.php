<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;

/**
 * VerifyApiUser Middleware
 *
 * Since this app uses stateless API + localStorage (no Sanctum tokens yet),
 * we verify requests by checking X-User-Id and X-User-Role headers sent
 * by the React frontend against the database. This prevents anonymous
 * access to protected CRUD endpoints.
 *
 * Frontend must send these headers with every authenticated request:
 *   X-User-Id: {user.id}
 *   X-User-Role: {user.role}
 */
class VerifyApiUser
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $userId = $request->header('X-User-Id');
        $userRole = $request->header('X-User-Role');

        if (!$userId || !$userRole) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Authentication required.'
            ], 401);
        }

        $user = User::find($userId);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. User not found.'
            ], 401);
        }

        // If specific roles are required, check them
        if (!empty($roles) && !in_array($user->role, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. Insufficient permissions.'
            ], 403);
        }

        // Attach user to request for use in controllers
        $request->merge(['_verified_user' => $user]);

        return $next($request);
    }
}
