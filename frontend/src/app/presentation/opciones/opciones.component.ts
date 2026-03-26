import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <section class="admin-page">
      <header class="page-header">
        <div>
          <h1>Opciones de menú</h1>
          <p>Define qué rutas aparecen en el menú lateral y a qué perfiles pertenecen.</p>
        </div>
        <button mat-stroked-button type="button" (click)="resetForm()">
          <mat-icon>add</mat-icon>
          Nueva opción
        </button>
      </header>

      <div class="layout-grid">
        <form class="panel form-panel" [formGroup]="optionForm" (ngSubmit)="onSubmit()">
          <h2>{{ editingOptionId ? 'Editar opción' : 'Crear opción' }}</h2>
          <label>Nombre<input type="text" formControlName="name"></label>
          <label>Ruta<input type="text" formControlName="route"></label>
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
            <button mat-flat-button color="primary" type="submit" [disabled]="optionFacade.isLoading()">
              {{ editingOptionId ? 'Actualizar' : 'Crear' }}
            </button>
            @if (editingOptionId) {
              <button mat-stroked-button type="button" (click)="resetForm()">Cancelar</button>
            }
          </div>
        </form>

        <section class="panel list-panel">
          <h2>Opciones registradas</h2>
          @if (optionFacade.isLoading()) {
            <div class="loading-row"><mat-spinner diameter="32"></mat-spinner><span>Cargando opciones...</span></div>
          } @else if (!optionFacade.options().length) {
            <p>No hay opciones registradas.</p>
          } @else {
            <div class="card-list">
              @for (option of optionFacade.options(); track option.id) {
                <article class="entity-card">
                  <div>
                    <h3>{{ option.name }}</h3>
                    <p class="meta">{{ option.route }} · orden {{ option.sortOrder }} · {{ option.active ? 'Activa' : 'Inactiva' }}</p>
                    <p>Icono: {{ option.icon || 'menu' }}</p>
                  </div>
                  <div class="card-actions">
                    <button mat-stroked-button type="button" (click)="editOption(option)">Editar</button>
                    <button mat-flat-button type="button" class="danger-btn" (click)="deleteOption(option)">Eliminar</button>
                  </div>
                </article>
              }
            </div>
          }
        </section>
      </div>
    </section>
  `,
  styles: [`.admin-page{padding:1.5rem}.page-header{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;margin-bottom:1.5rem}.page-header h1{margin:0 0 .35rem}.page-header p{margin:0;color:#64748b}.layout-grid{display:grid;grid-template-columns:360px 1fr;gap:1rem}.panel{background:#fff;border-radius:16px;border:1px solid #e2e8f0;box-shadow:0 14px 38px rgba(15,23,42,.08);padding:1.25rem}.form-panel label{display:flex;flex-direction:column;gap:.35rem;margin-bottom:.85rem;color:#334155;font-weight:600}.form-panel input{border:1px solid #cbd5e1;border-radius:10px;padding:.8rem;font:inherit}.checkbox-row{flex-direction:row !important;align-items:center;gap:.6rem;font-weight:500}.multi-select{border:1px dashed #cbd5e1;border-radius:12px;padding:.85rem;margin-bottom:1rem}.multi-select p{margin:0 0 .6rem;font-weight:700}.form-actions,.card-actions{display:flex;gap:.75rem;flex-wrap:wrap}.card-list{display:flex;flex-direction:column;gap:.85rem}.entity-card{display:flex;justify-content:space-between;gap:1rem;border:1px solid #e2e8f0;border-radius:14px;padding:1rem}.entity-card h3{margin:0 0 .25rem}.meta{margin:0 0 .35rem;color:#0f766e;font-size:.85rem}.danger-btn{background:#b91c1c !important;color:#fff !important}.loading-row{display:flex;align-items:center;gap:.75rem}@media (max-width:960px){.layout-grid{grid-template-columns:1fr}}`]
})
export class OpcionesComponent implements OnInit {
  readonly optionFacade = inject(OptionManagementFacadeService);
  readonly roleFacade = inject(RoleManagementFacadeService);
  private readonly alertService = inject(AlertService);
  private readonly fb = inject(FormBuilder);

  editingOptionId: number | null = null;
  selectedRoleIds: number[] = [];

  readonly optionForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    route: ['', [Validators.required, Validators.maxLength(150)]],
    icon: ['menu', [Validators.maxLength(80)]],
    sortOrder: [0, [Validators.required, Validators.min(0)]],
    active: [true, Validators.required],
  });

  ngOnInit(): void {
    this.optionFacade.loadOptions().subscribe();
    this.roleFacade.loadRoles().subscribe();
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
      route: option.route,
      icon: option.icon ?? 'menu',
      sortOrder: option.sortOrder,
      active: option.active,
    });
  }

  resetForm(): void {
    this.editingOptionId = null;
    this.selectedRoleIds = [];
    this.optionForm.reset({ name: '', route: '', icon: 'menu', sortOrder: 0, active: true });
  }

  onSubmit(): void {
    if (this.optionForm.invalid) {
      this.optionForm.markAllAsTouched();
      return;
    }

    const payload = {
      name: this.optionForm.value.name ?? '',
      route: this.optionForm.value.route ?? '',
      icon: this.optionForm.value.icon ?? 'menu',
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
}