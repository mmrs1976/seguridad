<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\AdminRoleMiddleware;
use App\Http\Middleware\ValidateJwtTokenVersion;
use Tymon\JWTAuth\Http\Middleware\RefreshToken;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // En Laravel 12, prioriza registrar solo lo necesario
        $middleware->alias([
            'jwt.refresh' => RefreshToken::class,
            'admin' => AdminRoleMiddleware::class,
            'jwt.version' => ValidateJwtTokenVersion::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Ideal para manejar errores de Token de JWT de forma global en L12
    })->create();