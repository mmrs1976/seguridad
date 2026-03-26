<?php

namespace App\Http\Controllers;

use App\Models\Option;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OptionController extends Controller
{
    public function index()
    {
        return response()->json(
            Option::query()
                ->with('roles:id,name,code')
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get()
                ->map(fn (Option $option) => $this->serializeOption($option))
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:120|unique:options,name',
            'route' => 'required|string|max:150|unique:options,route',
            'icon' => 'nullable|string|max:80',
            'sort_order' => 'required|integer|min:0',
            'active' => 'required|boolean',
            'role_ids' => 'array',
            'role_ids.*' => 'integer|exists:roles,id',
        ]);

        $option = Option::create([
            'name' => $data['name'],
            'route' => $data['route'],
            'icon' => $data['icon'] ?? 'menu',
            'sort_order' => $data['sort_order'],
            'active' => $data['active'],
        ]);

        $option->roles()->sync($data['role_ids'] ?? []);
        $option->load('roles:id,name,code');

        return response()->json([
            'message' => 'Opción creada correctamente.',
            'option' => $this->serializeOption($option),
        ], 201);
    }

    public function update(Request $request, Option $option)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120', Rule::unique('options', 'name')->ignore($option->id)],
            'route' => ['required', 'string', 'max:150', Rule::unique('options', 'route')->ignore($option->id)],
            'icon' => 'nullable|string|max:80',
            'sort_order' => 'required|integer|min:0',
            'active' => 'required|boolean',
            'role_ids' => 'array',
            'role_ids.*' => 'integer|exists:roles,id',
        ]);

        $option->update([
            'name' => $data['name'],
            'route' => $data['route'],
            'icon' => $data['icon'] ?? 'menu',
            'sort_order' => $data['sort_order'],
            'active' => $data['active'],
        ]);

        $option->roles()->sync($data['role_ids'] ?? []);
        $option->load('roles:id,name,code');

        return response()->json([
            'message' => 'Opción actualizada correctamente.',
            'option' => $this->serializeOption($option),
        ]);
    }

    public function destroy(Option $option)
    {
        $option->roles()->detach();
        $option->delete();

        return response()->json([
            'message' => 'Opción eliminada correctamente.',
        ]);
    }

    private function serializeOption(Option $option): array
    {
        return [
            'id' => $option->id,
            'name' => $option->name,
            'route' => $option->route,
            'icon' => $option->icon,
            'sort_order' => $option->sort_order,
            'active' => $option->active,
            'role_ids' => $option->roles->pluck('id')->all(),
            'roles' => $option->roles->map(fn ($role) => [
                'id' => $role->id,
                'name' => $role->name,
                'code' => $role->code,
            ])->values()->all(),
        ];
    }
}