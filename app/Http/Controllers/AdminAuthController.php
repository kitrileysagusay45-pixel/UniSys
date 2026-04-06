<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class AdminAuthController extends Controller
{
    /**
     * Register a new admin user
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|regex:/^(?=.*[A-Z])(?=.*[0-9]).+$/|confirmed',
            'phone' => 'required|string|size:11',
            'address' => 'required|string|max:255',
            'tin' => 'nullable|string|max:50',
            'profile_picture' => 'nullable|image|mimes:jpeg,jpg,png,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Handle profile picture upload
            $profilePicturePath = null;
            if ($request->hasFile('profile_picture')) {
                $profilePicturePath = $request->file('profile_picture')->store('profile_pictures', 'public');
            }

            // 1. Create User account
            $user = User::create([
                'name' => $request->name,
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'profile_picture' => $profilePicturePath,
                'phone' => $request->phone,
                'address' => $request->address,
                'tin' => $request->tin,
                'role' => 'admin',
            ]);

            // 2. Create Admin profile
            $adminCount = Admin::count() + 1;
            $adminId = "ADM-" . date('Y') . "-" . str_pad($adminCount, 4, '0', STR_PAD_LEFT);

            $admin = Admin::create([
                'user_id' => $user->id,
                'admin_id' => $adminId,
                'status' => 'Active',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Admin registered successfully',
                'user' => $user,
                'admin_id' => $adminId
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Registration failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Login admin user
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Find user by username or email and check if they are an admin
        $user = User::where(function($query) use ($request) {
                        $query->where('username', $request->username)
                              ->orWhere('email', $request->username);
                    })
                    ->where('role', 'admin')
                    ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid username or password'
            ], 401);
        }

        // Fetch associated Admin profile
        $admin = $user->admin;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'id'              => $user->id,
                'name'            => $user->name,
                'username'        => $user->username,
                'email'           => $user->email,
                'phone'           => $user->phone,
                'address'         => $user->address,
                'profile_picture' => $user->profile_picture,
                'role'            => 'admin',
                'admin_id'        => $admin->admin_id ?? null,
            ],
        ], 200);
    }
}
