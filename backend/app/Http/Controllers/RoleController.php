<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    public function index()
    {
        return response()->json(
            Role::query()
                ->with('options:id,name,route,icon,sort_order,active')
                ->orderBy('id')
                ->get()
                ->map(fn (Role $role) => $this->serializeRole($role))
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:120|unique:roles,name',
            'code' => 'required|string|max:80|unique:roles,code',
            'description' => 'nullable|string|max:255',
            'active' => 'required|boolean',
            'option_ids' => 'array',
            'option_ids.*' => 'integer|exists:options,id',
        ]);

        $role = Role::create([
            'name' => $data['name'],
            'code' => strtolower($data['code']),
            'description' => $data['description'] ?? null,
            'active' => $data['active'],
        ]);

        $role->options()->sync($data['option_ids'] ?? []);
        $role->load('options:id,name,route,icon,sort_order,active');

        AuditLog::query()->create([
            'user_id' => optional($request->user('api'))->id,
            'action' => 'role.created',
            'target_type' => 'role',
            'target_id' => $role->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'metadata' => [
                'code' => $role->code,
            ],
        ]);

        return response()->json([
            'message' => 'Perfil creado correctamente.',
            'role' => $this->serializeRole($role),
        ], 201);
    }

    public function update(Request $request, Role $role)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120', Rule::unique('roles', 'name')->ignore($role->id)],
            'code' => ['required', 'string', 'max:80', Rule::unique('roles', 'code')->ignore($role->id)],
            'description' => 'nullable|string|max:255',
            'active' => 'required|boolean',
            'option_ids' => 'array',
            'option_ids.*' => 'integer|exists:options,id',
        ]);

        if (in_array($role->code, ['admin', 'applicant'], true) && !$data['active']) {
            return response()->json([
                'message' => 'No puedes desactivar un perfil base del sistema.',
            ], 422);
        }

        $role->update([
            'name' => $data['name'],
            'code' => strtolower($data['code']),
            'description' => $data['description'] ?? null,
            'active' => $data['active'],
        ]);

        $role->options()->sync($data['option_ids'] ?? []);
        $role->load('options:id,name,route,icon,sort_order,active');

        AuditLog::query()->create([
            'user_id' => optional($request->user('api'))->id,
            'action' => 'role.updated',
            'target_type' => 'role',
            'target_id' => $role->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'metadata' => [
                'code' => $role->code,
                'active' => $role->active,
            ],
        ]);

        return response()->json([
            'message' => 'Perfil actualizado correctamente.',
            'role' => $this->serializeRole($role),
        ]);
    }

    public function destroy(Role $role)
    {
        $roleName = $role->name;
        $roleId = $role->id;

        if (in_array($role->code, ['admin', 'applicant'], true)) {
            return response()->json([
                'message' => 'No puedes eliminar un perfil base del sistema.',
            ], 422);
        }

        if ($role->users()->exists()) {
            return response()->json([
                'message' => 'No puedes eliminar un perfil que tiene usuarios asignados.',
            ], 422);
        }

        $role->options()->detach();
        $role->delete();

        AuditLog::query()->create([
            'user_id' => optional(request()->user('api'))->id,
            'action' => 'role.deleted',
            'target_type' => 'role',
            'target_id' => $roleId,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'metadata' => [
                'name' => $roleName,
            ],
        ]);

        return response()->json([
            'message' => 'Perfil eliminado correctamente.',
        ]);
    }

    private function serializeRole(Role $role): array
    {
        return [
            'id' => $role->id,
            'name' => $role->name,
            'code' => $role->code,
            'description' => $role->description,
            'active' => $role->active,
            'option_ids' => $role->options->pluck('id')->all(),
            'options' => $role->options->map(fn ($option) => [
                'id' => $option->id,
                'name' => $option->name,
                'route' => $option->route,
                'icon' => $option->icon,
                'sort_order' => $option->sort_order,
                'active' => $option->active,
            ])->values()->all(),
        ];
    }
}