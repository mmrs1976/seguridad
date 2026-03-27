<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Option;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OptionController extends Controller
{
    public function index()
    {
        return response()->json(
            Option::query()
                ->with(['roles:id,name,code', 'parent:id,name'])
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
            'route' => 'nullable|string|max:150|unique:options,route',
            'icon' => 'nullable|string|max:80',
            'is_group' => 'required|boolean',
            'parent_id' => 'nullable|integer|exists:options,id',
            'sort_order' => 'required|integer|min:0',
            'active' => 'required|boolean',
            'role_ids' => 'array',
            'role_ids.*' => 'integer|exists:roles,id',
        ]);

        if (!$data['is_group'] && empty($data['route'])) {
            return response()->json([
                'message' => 'La ruta es obligatoria para opciones hijas o enlaces directos.',
            ], 422);
        }

        if ($data['is_group']) {
            $data['route'] = null;
            $data['parent_id'] = null;
        }

        if (!empty($data['parent_id'])) {
            $parent = Option::query()->find($data['parent_id']);
            if (!$parent || !$parent->is_group) {
                return response()->json([
                    'message' => 'La opción padre seleccionada no es válida.',
                ], 422);
            }
        }

        $option = Option::create([
            'name' => $data['name'],
            'route' => $data['route'] ?? null,
            'icon' => $data['icon'] ?? 'menu',
            'is_group' => $data['is_group'],
            'parent_id' => $data['parent_id'] ?? null,
            'sort_order' => $data['sort_order'],
            'active' => $data['active'],
        ]);

        $option->roles()->sync($data['role_ids'] ?? []);
        $option->load(['roles:id,name,code', 'parent:id,name']);

        $this->logAudit($request, 'option.created', $option->id, [
            'name' => $option->name,
            'is_group' => $option->is_group,
            'parent_id' => $option->parent_id,
        ]);

        return response()->json([
            'message' => 'Opción creada correctamente.',
            'option' => $this->serializeOption($option),
        ], 201);
    }

    public function update(Request $request, Option $option)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120', Rule::unique('options', 'name')->ignore($option->id)],
            'route' => ['nullable', 'string', 'max:150', Rule::unique('options', 'route')->ignore($option->id)],
            'icon' => 'nullable|string|max:80',
            'is_group' => 'required|boolean',
            'parent_id' => 'nullable|integer|exists:options,id',
            'sort_order' => 'required|integer|min:0',
            'active' => 'required|boolean',
            'role_ids' => 'array',
            'role_ids.*' => 'integer|exists:roles,id',
        ]);

        if (!$data['is_group'] && empty($data['route'])) {
            return response()->json([
                'message' => 'La ruta es obligatoria para opciones hijas o enlaces directos.',
            ], 422);
        }

        if ($data['is_group']) {
            $data['route'] = null;
            $data['parent_id'] = null;
        }

        if (!empty($data['parent_id'])) {
            if ((int) $data['parent_id'] === (int) $option->id) {
                return response()->json([
                    'message' => 'Una opción no puede ser padre de sí misma.',
                ], 422);
            }

            $parent = Option::query()->find($data['parent_id']);
            if (!$parent || !$parent->is_group) {
                return response()->json([
                    'message' => 'La opción padre seleccionada no es válida.',
                ], 422);
            }
        }

        $option->update([
            'name' => $data['name'],
            'route' => $data['route'] ?? null,
            'icon' => $data['icon'] ?? 'menu',
            'is_group' => $data['is_group'],
            'parent_id' => $data['parent_id'] ?? null,
            'sort_order' => $data['sort_order'],
            'active' => $data['active'],
        ]);

        $option->roles()->sync($data['role_ids'] ?? []);
        $option->load(['roles:id,name,code', 'parent:id,name']);

        $this->logAudit($request, 'option.updated', $option->id, [
            'name' => $option->name,
            'is_group' => $option->is_group,
            'parent_id' => $option->parent_id,
        ]);

        return response()->json([
            'message' => 'Opción actualizada correctamente.',
            'option' => $this->serializeOption($option),
        ]);
    }

    public function destroy(Option $option)
    {
        if ($option->children()->exists()) {
            return response()->json([
                'message' => 'No puedes eliminar una opción padre que tiene opciones hijas.',
            ], 422);
        }

        $option->roles()->detach();
        $option->delete();

        $this->logAudit(request(), 'option.deleted', $option->id, [
            'name' => $option->name,
        ]);

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
            'is_group' => (bool) $option->is_group,
            'parent_id' => $option->parent_id,
            'parent_name' => $option->parent?->name,
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

    private function logAudit(Request $request, string $action, ?int $targetId, array $metadata = []): void
    {
        AuditLog::query()->create([
            'user_id' => optional($request->user('api'))->id,
            'action' => $action,
            'target_type' => 'option',
            'target_id' => $targetId,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'metadata' => $metadata,
        ]);
    }
}