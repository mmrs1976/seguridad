<?php 

use App\Http\Controllers\AuthController;
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