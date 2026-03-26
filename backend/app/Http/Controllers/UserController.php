<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        $users = User::query()
            ->with('role:id,name,code')
            ->orderByDesc('id')
            ->get(['id', 'name', 'email', 'email_verified_at', 'active', 'role_id', 'created_at', 'updated_at']);

        return response()->json($users->map(fn (User $user) => $this->serializeUser($user)));
    }

    public function updateActive(Request $request, User $user)
    {
        $data = $request->validate([
            'active' => 'required|boolean',
        ]);

        $authenticatedUser = auth('api')->user();
        if ($authenticatedUser && (int) $authenticatedUser->id === (int) $user->id && !$data['active']) {
            return response()->json([
                'message' => 'No puedes desactivar tu propio usuario mientras tienes la sesión activa.',
            ], 422);
        }

        $user->forceFill([
            'active' => $data['active'],
        ])->save();

        return response()->json([
            'message' => $data['active'] ? 'Usuario activado correctamente.' : 'Usuario desactivado correctamente.',
            'user' => $this->serializeUser($user->fresh()->load('role')),
        ]);
    }

    public function updateRole(Request $request, User $user)
    {
        $data = $request->validate([
            'role_id' => 'required|integer|exists:roles,id',
        ]);

        $authenticatedUser = auth('api')->user();
        if ($authenticatedUser && (int) $authenticatedUser->id === (int) $user->id) {
            return response()->json([
                'message' => 'No puedes cambiar tu propio perfil mientras tienes la sesión activa.',
            ], 422);
        }

        $user->forceFill(['role_id' => $data['role_id']])->save();

        return response()->json([
            'message' => 'Perfil del usuario actualizado correctamente.',
            'user' => $this->serializeUser($user->fresh()->load('role')),
        ]);
    }

    public function destroy(User $user)
    {
        $authenticatedUser = auth('api')->user();
        if ($authenticatedUser && (int) $authenticatedUser->id === (int) $user->id) {
            return response()->json([
                'message' => 'No puedes eliminar tu propio usuario mientras tienes la sesión activa.',
            ], 422);
        }

        $user->delete();

        return response()->json([
            'message' => 'Usuario eliminado correctamente.',
        ]);
    }

    private function serializeUser(User $user): array
    {
        return [
            'id' => (string) $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'active' => (bool) $user->active,
            'email_verified_at' => optional($user->email_verified_at)?->toISOString(),
            'role_id' => $user->role_id,
            'role_name' => $user->role?->name,
            'role_code' => $user->role?->code,
        ];
    }
}