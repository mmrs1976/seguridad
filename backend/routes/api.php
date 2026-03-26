<?php 

use App\Http\Controllers\AuthController;
use App\Http\Controllers\NavigationController;
use App\Http\Controllers\OptionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SurveyController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
    Route::post('/resend-activation', [AuthController::class, 'resendActivation'])
        ->middleware('throttle:activation-resend');
    Route::get('/activate/{id}/{hash}', [AuthController::class, 'activate'])
        ->middleware('signed')
        ->name('auth.activate');

    Route::middleware('auth:api')->group(function () {
        Route::post('/logout',  [AuthController::class, 'logout']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
        Route::get('/me',       [AuthController::class, 'me']);
    });
});

Route::middleware('auth:api')->get('/navigation', [NavigationController::class, 'index']);

Route::middleware(['auth:api', 'admin'])->prefix('users')->group(function () {
    Route::get('/', [UserController::class, 'index']);
    Route::patch('/{user}/active', [UserController::class, 'updateActive']);
    Route::patch('/{user}/role', [UserController::class, 'updateRole']);
    Route::delete('/{user}', [UserController::class, 'destroy']);
});

Route::middleware('auth:api')->prefix('survey')->group(function () {
    Route::get('/', [SurveyController::class, 'show']);
    Route::post('/', [SurveyController::class, 'store']);
});

Route::middleware(['auth:api', 'admin'])->prefix('roles')->group(function () {
    Route::get('/', [RoleController::class, 'index']);
    Route::post('/', [RoleController::class, 'store']);
    Route::put('/{role}', [RoleController::class, 'update']);
    Route::delete('/{role}', [RoleController::class, 'destroy']);
});

Route::middleware(['auth:api', 'admin'])->prefix('options')->group(function () {
    Route::get('/', [OptionController::class, 'index']);
    Route::post('/', [OptionController::class, 'store']);
    Route::put('/{option}', [OptionController::class, 'update']);
    Route::delete('/{option}', [OptionController::class, 'destroy']);
});