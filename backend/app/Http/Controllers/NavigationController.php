<?php

namespace App\Http\Controllers;

use App\Models\Option;
use Illuminate\Http\Request;

class NavigationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user('api');
        if (!$user) {
            return response()->json(['message' => 'No autenticado.'], 401);
        }

        $role = $user->role;
        if (!$role) {
            return response()->json(['items' => []]);
        }

        $assignedOptions = $role->options()
            ->where('options.active', true)
            ->orderBy('options.sort_order')
            ->orderBy('options.id')
            ->get(['options.id', 'options.name', 'options.route', 'options.icon', 'options.is_group', 'options.parent_id', 'options.sort_order']);

        $parentIds = $assignedOptions->pluck('parent_id')->filter()->unique()->values();
        $parentOptions = $parentIds->isEmpty()
            ? collect()
            : Option::query()
                ->whereIn('id', $parentIds)
                ->where('active', true)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get(['id', 'name', 'route', 'icon', 'is_group', 'parent_id', 'sort_order']);

        $allOptions = $assignedOptions
            ->concat($parentOptions)
            ->unique('id')
            ->sortBy(['sort_order', 'id'])
            ->values();

        $childrenByParent = $assignedOptions
            ->whereNotNull('parent_id')
            ->groupBy('parent_id');

        $items = [];

        foreach ($allOptions as $option) {
            if ($option->parent_id) {
                continue;
            }

            if ($option->is_group) {
                $children = ($childrenByParent->get($option->id) ?? collect())
                    ->sortBy(['sort_order', 'id'])
                    ->values()
                    ->map(fn ($child) => [
                        'id' => $child->id,
                        'name' => $child->name,
                        'route' => $child->route,
                        'icon' => $child->icon,
                        'is_group' => false,
                        'parent_id' => $child->parent_id,
                        'sort_order' => $child->sort_order,
                        'children' => [],
                    ])->all();

                if (!empty($children) || $assignedOptions->contains('id', $option->id)) {
                    $items[] = [
                        'id' => $option->id,
                        'name' => $option->name,
                        'route' => null,
                        'icon' => $option->icon,
                        'is_group' => true,
                        'parent_id' => null,
                        'sort_order' => $option->sort_order,
                        'children' => $children,
                    ];
                }

                continue;
            }

            if ($assignedOptions->contains('id', $option->id)) {
                $items[] = [
                    'id' => $option->id,
                    'name' => $option->name,
                    'route' => $option->route,
                    'icon' => $option->icon,
                    'is_group' => false,
                    'parent_id' => null,
                    'sort_order' => $option->sort_order,
                    'children' => [],
                ];
            }
        }

        return response()->json([
            'items' => array_values($items),
        ]);
    }
}