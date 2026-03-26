<?php

namespace App\Http\Controllers;

use App\Mail\UserActivationMail;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;

class AuthController extends Controller
{
    private const RECAPTCHA_TEST_SECRET = '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe';

    public function register(Request $request)
    {
        $data = $request->validate([
            'name'          => 'required|string',
            'email'         => 'required|email',
            'password'      => 'required|min:8',
            'captcha_token' => 'required|string',
        ]);

        if (User::where('email', $data['email'])->exists()) {
            return response()->json([
                'message' => 'Ya existe un usuario registrado con ese correo electrónico.',
            ], 409);
        }

        $isLocalLikeEnv = app()->environment(['local', 'development']);
        $configuredSecret = (string) config('services.recaptcha.secret_key', '');

        if (!$isLocalLikeEnv || !empty($configuredSecret)) {
            $recaptchaSecret = $configuredSecret;
            if (empty($recaptchaSecret) && $isLocalLikeEnv) {
                $recaptchaSecret = self::RECAPTCHA_TEST_SECRET;
            }

            if (empty($recaptchaSecret)) {
                return response()->json([
                    'message' => 'Captcha no configurado en el servidor.',
                ], 500);
            }

            if (!$this->verifyRecaptchaToken($data['captcha_token'], $request->ip(), $recaptchaSecret)) {
                return response()->json([
                    'message' => 'Captcha inválido. Intenta nuevamente.',
                ], 422);
            }
        }

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'active'   => false,
            'role_id'  => Role::query()->where('code', 'applicant')->value('id') ?? 2,
        ]);

        $activationUrl = URL::temporarySignedRoute(
            'auth.activate',
            now()->addHours(24),
            [
                'id' => $user->id,
                'hash' => sha1($user->email),
            ]
        );

        Mail::to($user->email)->send(new UserActivationMail($user->name, $activationUrl));

        return response()->json([
            'message' => 'Usuario registrado. Revisa tu correo para activar la cuenta.',
            'user' => $this->serializeUser($user->load('role')),
        ], 201);
    }

    private function verifyRecaptchaToken(string $token, ?string $ip, string $secret): bool
    {
        try {
            $response = Http::asForm()
                ->timeout(10)
                ->post('https://www.google.com/recaptcha/api/siteverify', [
                    'secret' => $secret,
                    'response' => $token,
                    'remoteip' => $ip,
                ]);

            if (!$response->ok()) {
                return false;
            }

            $body = $response->json();
            return (bool) ($body['success'] ?? false);
        } catch (\Throwable $e) {
            return false;
        }
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json(['message' => 'Credenciales inválidas'], 401);
        }

        $user = JWTAuth::setToken($token)->user();

        if (!$user || !$user->active) {
            JWTAuth::invalidate($token);

            return response()->json([
                'message' => 'Cuenta inactiva. Revisa tu correo y activa tu usuario.',
            ], 403);
        }

        return $this->respondWithToken($token);
    }

    public function activate(string $id, string $hash)
    {
        $user = User::find($id);

        if (!$user || !hash_equals((string) $hash, sha1($user->email))) {
            return response()->json(['message' => 'Enlace de activación inválido'], 404);
        }

        if (!is_null($user->email_verified_at)) {
            return response()->json(['message' => 'La cuenta ya está activada']);
        }

        $user->forceFill([
            'email_verified_at' => now(),
            'active' => true,
        ])->save();

        return response()->json(['message' => 'Cuenta activada correctamente']);
    }

    public function resendActivation(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $data['email'])->firstOrFail();

        if (!is_null($user->email_verified_at)) {
            return response()->json([
                'message' => 'La cuenta ya está activada.',
            ], 409);
        }

        $activationUrl = URL::temporarySignedRoute(
            'auth.activate',
            now()->addHours(24),
            [
                'id' => $user->id,
                'hash' => sha1($user->email),
            ]
        );

        Mail::to($user->email)->send(new UserActivationMail($user->name, $activationUrl));

        return response()->json([
            'message' => 'Se envio un nuevo correo de activacion.',
        ]);
    }

    public function logout()
    {
        try {
            $token = JWTAuth::getToken();

            if (!$token) {
                return response()->json(['message' => 'Token no encontrado'], 401);
            }

            JWTAuth::invalidate($token);

            return response()->json(['message' => 'Sesión cerrada']);
        } catch (TokenInvalidException $e) {
            return response()->json(['message' => 'Token inválido'], 401);
        } catch (TokenExpiredException $e) {
            return response()->json(['message' => 'Token expirado'], 401);
        } catch (JWTException $e) {
            return response()->json(['message' => 'No se pudo cerrar sesión'], 401);
        }
    }

    public function me()
    {
        $user = auth('api')->user();

        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        return response()->json($this->serializeUser($user->load('role')));
    }

    public function refresh(Request $request)
    {
        try {
            $oldToken = JWTAuth::getToken();

            if (!$oldToken) {
                return response()->json(['message' => 'Token no encontrado'], 401);
            }

            $newToken = JWTAuth::refresh($oldToken);

            return $this->respondWithToken($newToken);
        } catch (TokenExpiredException $e) {
            return response()->json(['message' => 'Token expirado'], 401);
        } catch (TokenInvalidException $e) {
            return response()->json(['message' => 'Token inválido'], 401);
        } catch (JWTException $e) {
            return response()->json(['message' => 'Token no encontrado'], 401);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'No se pudo refrescar el token'], 500);
        }
    }

    private function respondWithToken($token)
    {
        $user = auth('api')->user()?->load('role');

        return response()->json([
            'token'      => $token,
            'token_type' => 'bearer',
            'expires_in' => JWTAuth::factory()->getTTL() * 60,
            'user'       => $user ? $this->serializeUser($user) : null,
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