<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Faculty;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Mail\PasswordResetMail;

class PasswordResetController extends Controller
{
    /**
     * Send reset link email
     */
    public function sendResetLinkEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $email = $request->email;
        $userType = null;
        $foundUser = null;

        // Check in faculty first
        $foundUser = Faculty::where('email', $email)->first();
        if ($foundUser) {
            $userType = 'faculty';
        } else {
            // Check in student
            $foundUser = Student::where('email', $email)->first();
            if ($foundUser) {
                $userType = 'student';
            } else {
                // Check in users (for admin)
                $foundUser = User::where('email', $email)->first();
                if ($foundUser) {
                    $userType = $foundUser->role;
                }
            }
        }

        if (!$foundUser) {
            return response()->json([
                'success' => false,
                'message' => 'No user found with this email address.'
            ], 404);
        }

        // Create token
        $token = Str::random(64);

        // Delete any existing tokens for this email
        DB::table('password_resets')->where('email', $email)->delete();

        // Insert new token
        DB::table('password_resets')->insert([
            'email' => $email,
            'token' => $token,
            'created_at' => now()
        ]);

        // Send Email
        try {
            $resetLink = url("/reset-password?token={$token}&email=" . urlencode($email));
            Mail::to($email)->send(new PasswordResetMail($resetLink, $foundUser->first_name ?? $foundUser->name));

            return response()->json([
                'success' => true,
                'message' => 'Password reset link has been sent to your email.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send email: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reset password
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token'    => 'required',
            'email'    => 'required|email',
            'password' => 'required|string|min:8|regex:/^(?=.*[A-Z])(?=.*[0-9]).+$/|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $reset = DB::table('password_resets')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (!$reset) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired token.'
            ], 400);
        }

        // Token is valid for 1 hour
        if (now()->diffInHours(Carbon::parse($reset->created_at)) > 1) {
            DB::table('password_resets')->where('email', $request->email)->delete();
            return response()->json([
                'success' => false,
                'message' => 'Token has expired.'
            ], 400);
        }

        $newPassword = Hash::make($request->password);

        // Update in Faculty
        $faculty = Faculty::where('email', $request->email)->first();
        if ($faculty) {
            $faculty->password = $newPassword;
            $faculty->save();
        }

        // Update in Student
        $student = Student::where('email', $request->email)->first();
        if ($student) {
            $student->password = $newPassword;
            $student->save();
        }

        // Update in Users table
        $user = User::where('email', $request->email)->first();
        if ($user) {
            $user->password = $newPassword;
            $user->save();
        }

        // Delete token
        DB::table('password_resets')->where('email', $request->email)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Your password has been reset successfully.'
        ]);
    }
}
