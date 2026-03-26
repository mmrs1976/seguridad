<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NavigationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user('api');
        if (!$user) {
            return response()->json(['message' => 'No autenticado.'], 401);
        }

        $user->loadMissing('role.options');

        $options = $user->role?->options
            ->where('active', true)
            ->sortBy('sort_order')
            ->values()
            ->map(fn ($option) => [
                'id' => $option->id,
                'name' => $option->name,
                'route' => $option->route,
                'icon' => $option->icon,
                'sort_order' => $option->sort_order,
            ])
            ->all() ?? [];

        return response()->json([
            'items' => $options,
        ]);
    }
}