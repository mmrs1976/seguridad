import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AlertService } from '../../core/services/alert.service';
import { OptionManagementFacadeService } from '../../core/services/option-management-facade.service';
import { RoleManagementFacadeService } from '../../core/services/role-management-facade.service';
import { MenuOptionEntity } from '../../domain/entities/menu-option.entity';

@Component({
  selector: 'app-opciones',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <section class="admin-page">
      <header class="page-header">
        <div>
          <h1>Opciones de menú</h1>
          <p>Define qué rutas aparecen en el menú lateral y a qué perfiles pertenecen.</p>
        </div>
        <button mat-stroked-button type="button" class="icon-action-btn" (click)="resetForm()" aria-label="Nueva opción" title="Nueva opción">
          <img src="/icons/add.svg" alt="Nueva opción" class="action-icon">
        </button>
      </header>

      <div class="layout-grid">
        <form class="panel form-panel" [formGroup]="optionForm" (ngSubmit)="onSubmit()">
          <h2>{{ editingOptionId ? 'Editar opción' : 'Crear opción' }}</h2>
          <label>Nombre<input type="text" formControlName="name"></label>
          <label class="checkbox-row"><input type="checkbox" formControlName="isGroup">Es agrupador (opción padre sin ruta)</label>
          <label>
            Ruta
            <input type="text" formControlName="route" [disabled]="!!optionForm.value.isGroup" placeholder="/home/...">
          </label>
          @if (!optionForm.value.isGroup) {
            <label>
              Opción padre (agrupador)
              <select formControlName="parentId">
                <option [ngValue]="null">Sin padre</option>
                @for (parent of availableParentOptions(); track parent.id) {
                  <option [ngValue]="parent.id">{{ parent.name }}</option>
                }
              </select>
            </label>
          }
          <label>Icono<input type="text" formControlName="icon"></label>
          <label>Orden<input type="number" formControlName="sortOrder"></label>
          <label class="checkbox-row"><input type="checkbox" formControlName="active">Opción activa</label>

          <div class="multi-select">
            <p>Perfiles asignados</p>
            @for (role of roleFacade.roles(); track role.id) {
              <label class="checkbox-row">
                <input type="checkbox" [checked]="selectedRoleIds.includes(role.id)" (change)="toggleRole(role.id, $any($event.target).checked)">
                {{ role.name }}
              </label>
            }
          </div>

          <div class="form-actions">
            <button mat-flat-button color="primary" type="submit" class="icon-action-btn" [disabled]="optionFacade.isLoading()" [attr.aria-label]="editingOptionId ? 'Actualizar' : 'Crear'" [title]="editingOptionId ? 'Actualizar' : 'Crear'">
              <img [src]="editingOptionId ? '/icons/edit.svg' : '/icons/add.svg'" [alt]="editingOptionId ? 'Actualizar' : 'Crear'" class="action-icon light-icon">
            </button>
            @if (editingOptionId) {
              <button mat-stroked-button type="button" (click)="resetForm()">Cancelar</button>
            }
          </div>
        </form>

        <section class="panel list-panel">
          <h2>Opciones registradas</h2>
          <label class="search-inline">
            Buscar
                <input type="search" [(ngModel)]="searchTerm" placeholder="Nombre, ruta, icono o tipo">
          </label>
          @if (optionFacade.isLoading()) {
            <div class="loading-row"><mat-spinner diameter="32"></mat-spinner><span>Cargando opciones...</span></div>
          } @else if (!filteredOptions().length) {
            <p>No hay opciones registradas.</p>
          } @else {
            <div class="card-list">
              @for (option of filteredOptions(); track option.id) {
                <article class="entity-card">
                  <div>
                    <h3>{{ option.name }}</h3>
                    <p class="meta">{{ option.route || 'Sin ruta' }} · orden {{ option.sortOrder }} · {{ option.active ? 'Activa' : 'Inactiva' }}</p>
                    <p class="meta">{{ option.isGroup ? 'Agrupador' : 'Enlace' }}{{ option.parentId ? ' · Padre #' + option.parentId : '' }}</p>
                    <p>Icono: {{ option.icon || 'menu' }}</p>
                  </div>
                  <div class="card-actions">
                    <button mat-stroked-button type="button" class="icon-action-btn" (click)="editOption(option)" aria-label="Editar" title="Editar">
                      <img src="/icons/edit.svg" alt="Editar" class="action-icon">
                    </button>
                    <button mat-flat-button type="button" class="icon-action-btn danger-btn" (click)="deleteOption(option)" aria-label="Eliminar" title="Eliminar">
                      <img src="/icons/delete.svg" alt="Eliminar" class="action-icon">
                    </button>
                  </div>
                </article>
              }
            </div>
          }
        </section>
      </div>
    </section>
  `,
  styles: [`.admin-page{padding:1.5rem}.page-header{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;margin-bottom:1.5rem}.page-header h1{margin:0 0 .35rem}.page-header p{margin:0;color:#64748b}.layout-grid{display:grid;grid-template-columns:360px 1fr;gap:1rem}.panel{background:#fff;border-radius:16px;border:1px solid #e2e8f0;box-shadow:0 14px 38px rgba(15,23,42,.08);padding:1.25rem}.form-panel label{display:flex;flex-direction:column;gap:.35rem;margin-bottom:.85rem;color:#334155;font-weight:600}.form-panel input,.form-panel select{border:1px solid #cbd5e1;border-radius:10px;padding:.8rem;font:inherit;background:#fff}.form-panel input:disabled{background:#f1f5f9;color:#94a3b8}.checkbox-row{flex-direction:row !important;align-items:center;gap:.6rem;font-weight:500}.multi-select{border:1px dashed #cbd5e1;border-radius:12px;padding:.85rem;margin-bottom:1rem}.multi-select p{margin:0 0 .6rem;font-weight:700}.form-actions,.card-actions{display:flex;gap:.75rem;flex-wrap:wrap}.icon-action-btn{min-width:42px !important;width:42px;height:42px;padding:0 !important;border-radius:10px !important;display:inline-flex;align-items:center;justify-content:center}.action-icon{width:18px;height:18px;object-fit:contain}.light-icon{filter:brightness(0) saturate(100%) invert(100%)}.search-inline{display:flex;flex-direction:column;gap:.35rem;margin-bottom:.85rem;color:#334155;font-weight:600}.search-inline input{border:1px solid #cbd5e1;border-radius:10px;padding:.7rem;font:inherit}.card-list{display:flex;flex-direction:column;gap:.85rem}.entity-card{display:flex;justify-content:space-between;gap:1rem;border:1px solid #e2e8f0;border-radius:14px;padding:1rem}.entity-card h3{margin:0 0 .25rem}.meta{margin:0 0 .35rem;color:#0f766e;font-size:.85rem}.danger-btn{background:#fee2e2 !important}.loading-row{display:flex;align-items:center;gap:.75rem}@media (max-width:960px){.layout-grid{grid-template-columns:1fr}}`]
})
export class OpcionesComponent implements OnInit {
  readonly optionFacade = inject(OptionManagementFacadeService);
  readonly roleFacade = inject(RoleManagementFacadeService);
  private readonly alertService = inject(AlertService);
  private readonly fb = inject(FormBuilder);

  editingOptionId: number | null = null;
  selectedRoleIds: number[] = [];
  searchTerm = '';

  readonly optionForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    isGroup: [false, Validators.required],
    route: ['', [Validators.maxLength(150)]],
    parentId: [null as number | null],
    icon: ['menu', [Validators.maxLength(80)]],
    sortOrder: [0, [Validators.required, Validators.min(0)]],
    active: [true, Validators.required],
  });

  ngOnInit(): void {
    this.optionFacade.loadOptions().subscribe();
    this.roleFacade.loadRoles().subscribe();

    this.optionForm.controls.isGroup.valueChanges.subscribe((isGroup) => {
      if (isGroup) {
        this.optionForm.controls.parentId.setValue(null);
        this.optionForm.controls.route.setValue('');
      }
    });
  }

  toggleRole(roleId: number, checked: boolean): void {
    this.selectedRoleIds = checked
      ? [...this.selectedRoleIds, roleId]
      : this.selectedRoleIds.filter((id) => id !== roleId);
  }

  editOption(option: MenuOptionEntity): void {
    this.editingOptionId = option.id;
    this.selectedRoleIds = [...(option.roleIds ?? [])];
    this.optionForm.patchValue({
      name: option.name,
      isGroup: option.isGroup ?? false,
      route: option.route ?? '',
      parentId: option.parentId ?? null,
      icon: option.icon ?? 'menu',
      sortOrder: option.sortOrder,
      active: option.active,
    });
  }

  resetForm(): void {
    this.editingOptionId = null;
    this.selectedRoleIds = [];
    this.optionForm.reset({ name: '', isGroup: false, route: '', parentId: null, icon: 'menu', sortOrder: 0, active: true });
  }

  onSubmit(): void {
    if (this.optionForm.invalid) {
      this.optionForm.markAllAsTouched();
      return;
    }

    const isGroup = !!this.optionForm.value.isGroup;
    const route = (this.optionForm.value.route ?? '').trim();
    if (!isGroup && !route) {
      void this.alertService.warning('Ruta requerida', 'Las opciones que no son agrupadores deben tener una ruta.');
      return;
    }

    const payload = {
      name: this.optionForm.value.name ?? '',
      route: isGroup ? null : route,
      icon: this.optionForm.value.icon ?? 'menu',
      isGroup,
      parentId: isGroup ? null : (this.optionForm.value.parentId ?? null),
      sortOrder: Number(this.optionForm.value.sortOrder ?? 0),
      active: this.optionForm.value.active ?? true,
      roleIds: this.selectedRoleIds,
    };

    const request$ = this.editingOptionId
      ? this.optionFacade.updateOption(this.editingOptionId, payload)
      : this.optionFacade.createOption(payload);

    request$.subscribe({
      next: () => {
        void this.alertService.success('Opción guardada', this.editingOptionId ? 'La opción fue actualizada.' : 'La opción fue creada.');
        this.resetForm();
      },
      error: (err: unknown) => {
        const message = err instanceof Error ? err.message : 'No se pudo guardar la opción';
        void this.alertService.error('Error', message);
      }
    });
  }

  deleteOption(option: MenuOptionEntity): void {
    void this.alertService.confirm('Eliminar opción', `¿Deseas eliminar la opción ${option.name}?`, 'Sí, eliminar', 'Cancelar').then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      this.optionFacade.deleteOption(option.id).subscribe({
        next: (message) => {
          void this.alertService.success('Opción eliminada', message);
          if (this.editingOptionId === option.id) {
            this.resetForm();
          }
        },
        error: (err: unknown) => {
          const message = err instanceof Error ? err.message : 'No se pudo eliminar la opción';
          void this.alertService.error('Error', message);
        }
      });
    });
  }

  filteredOptions(): MenuOptionEntity[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.optionFacade.options();
    }

    return this.optionFacade.options().filter((option) => {
      const name = option.name.toLowerCase();
      const route = (option.route ?? '').toLowerCase();
      const icon = (option.icon ?? '').toLowerCase();
      const type = option.isGroup ? 'agrupador' : 'enlace';
      return name.includes(term) || route.includes(term) || icon.includes(term) || type.includes(term);
    });
  }

  availableParentOptions(): MenuOptionEntity[] {
    return this.optionFacade
      .options()
      .filter((option) => (option.isGroup ?? false) && option.id !== this.editingOptionId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }
}