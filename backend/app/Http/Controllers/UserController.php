<?php

namespace App\Http\Controllers;

use App\Mail\UserActivationMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\URL;

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

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'nullable|string|min:8',
            'role_id' => 'required|integer|exists:roles,id',
            'active' => 'sometimes|boolean',
            'notify_user' => 'sometimes|boolean',
        ]);

        $active = (bool) ($data['active'] ?? true);
        $notifyUser = (bool) ($data['notify_user'] ?? false);
        $generatedPassword = empty($data['password']) ? Str::password(12) : null;
        $plainPassword = $generatedPassword ?? $data['password'];

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($plainPassword),
            'active' => $active,
            'email_verified_at' => $active ? now() : null,
            'role_id' => $data['role_id'],
        ]);

        if ($notifyUser) {
            if ($active) {
                Mail::raw(
                    "Hola {$user->name}, tu cuenta fue creada por un administrador. "
                    . "Ya puedes iniciar sesion con tu correo y la contrasena: {$plainPassword}",
                    function ($message) use ($user) {
                        $message->to($user->email)->subject('Cuenta creada');
                    }
                );
            } else {
                $activationUrl = URL::temporarySignedRoute(
                    'auth.activate',
                    now()->addHours(24),
                    [
                        'id' => $user->id,
                        'hash' => sha1($user->email),
                    ]
                );

                Mail::to($user->email)->send(new UserActivationMail($user->name, $activationUrl));
            }
        }

        return response()->json([
            'message' => $notifyUser
                ? 'Usuario creado correctamente y notificado por correo.'
                : 'Usuario creado correctamente.',
            'user' => $this->serializeUser($user->fresh()->load('role')),
            'generated_password' => $generatedPassword,
        ], 201);
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