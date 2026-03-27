<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Facades\JWTAuth;

class ValidateJwtTokenVersion
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user('api');
        if (!$user) {
            return response()->json(['message' => 'No autenticado.'], 401);
        }

        try {
            $payload = JWTAuth::parseToken()->getPayload();
            $tokenVersion = (int) ($payload->get('token_version') ?? -1);
        } catch (JWTException $e) {
            return response()->json(['message' => 'Token inválido.'], 401);
        }

        if ($tokenVersion !== (int) $user->token_version) {
            return response()->json([
                'message' => 'Tu sesión ya no es válida. Inicia sesión nuevamente.',
            ], 401);
        }

        return $next($request);
    }
}
