import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AlertService } from '../../core/services/alert.service';
import { OptionManagementFacadeService } from '../../core/services/option-management-facade.service';
import { RoleManagementFacadeService } from '../../core/services/role-management-facade.service';
import { RoleEntity } from '../../domain/entities/role.entity';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <section class="admin-page">
      <header class="page-header">
        <div>
          <h1>Perfiles / Roles</h1>
          <p>Define perfiles del sistema y asigna las opciones visibles en el menú lateral.</p>
        </div>
        <button mat-stroked-button type="button" (click)="resetForm()">
          <mat-icon>add</mat-icon>
          Nuevo perfil
        </button>
      </header>

      <div class="layout-grid">
        <form class="panel form-panel" [formGroup]="roleForm" (ngSubmit)="onSubmit()">
          <h2>{{ editingRoleId ? 'Editar perfil' : 'Crear perfil' }}</h2>
          <label>
            Nombre
            <input type="text" formControlName="name">
          </label>
          <label>
            Código
            <input type="text" formControlName="code">
          </label>
          <label>
            Descripción
            <textarea rows="3" formControlName="description"></textarea>
          </label>
          <label class="checkbox-row">
            <input type="checkbox" formControlName="active">
            Perfil activo
          </label>

          <div class="multi-select">
            <p>Opciones del menú</p>
            @for (option of optionFacade.options(); track option.id) {
              <label class="checkbox-row">
                <input type="checkbox" [checked]="selectedOptionIds.includes(option.id)" (change)="toggleOption(option.id, $any($event.target).checked)">
                {{ option.name }}
              </label>
            }
          </div>

          <div class="form-actions">
            <button mat-flat-button color="primary" type="submit" [disabled]="roleFacade.isLoading()">
              {{ editingRoleId ? 'Actualizar' : 'Crear' }}
            </button>
            @if (editingRoleId) {
              <button mat-stroked-button type="button" (click)="resetForm()">Cancelar</button>
            }
          </div>
        </form>

        <section class="panel list-panel">
          <h2>Perfiles existentes</h2>
          @if (roleFacade.isLoading()) {
            <div class="loading-row"><mat-spinner diameter="32"></mat-spinner><span>Cargando perfiles...</span></div>
          } @else if (!roleFacade.roles().length) {
            <p>No hay perfiles registrados.</p>
          } @else {
            <div class="card-list">
              @for (role of roleFacade.roles(); track role.id) {
                <article class="entity-card">
                  <div>
                    <h3>{{ role.name }}</h3>
                    <p class="meta">{{ role.code }} · {{ role.active ? 'Activo' : 'Inactivo' }}</p>
                    <p>{{ role.description || 'Sin descripción.' }}</p>
                  </div>
                  <div class="card-actions">
                    <button mat-stroked-button type="button" (click)="editRole(role)">Editar</button>
                    <button mat-flat-button type="button" class="danger-btn" (click)="deleteRole(role)">Eliminar</button>
                  </div>
                </article>
              }
            </div>
          }
        </section>
      </div>
    </section>
  `,
  styles: [`.admin-page{padding:1.5rem}.page-header{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;margin-bottom:1.5rem}.page-header h1{margin:0 0 .35rem}.page-header p{margin:0;color:#64748b}.layout-grid{display:grid;grid-template-columns:360px 1fr;gap:1rem}.panel{background:#fff;border-radius:16px;border:1px solid #e2e8f0;box-shadow:0 14px 38px rgba(15,23,42,.08);padding:1.25rem}.form-panel label{display:flex;flex-direction:column;gap:.35rem;margin-bottom:.85rem;color:#334155;font-weight:600}.form-panel input,.form-panel textarea{border:1px solid #cbd5e1;border-radius:10px;padding:.8rem;font:inherit}.checkbox-row{flex-direction:row !important;align-items:center;gap:.6rem;font-weight:500}.multi-select{border:1px dashed #cbd5e1;border-radius:12px;padding:.85rem;margin-bottom:1rem}.multi-select p{margin:0 0 .6rem;font-weight:700}.form-actions,.card-actions{display:flex;gap:.75rem;flex-wrap:wrap}.card-list{display:flex;flex-direction:column;gap:.85rem}.entity-card{display:flex;justify-content:space-between;gap:1rem;border:1px solid #e2e8f0;border-radius:14px;padding:1rem}.entity-card h3{margin:0 0 .25rem}.meta{margin:0 0 .35rem;color:#0f766e;font-size:.85rem}.danger-btn{background:#b91c1c !important;color:#fff !important}.loading-row{display:flex;align-items:center;gap:.75rem}@media (max-width:960px){.layout-grid{grid-template-columns:1fr}}`]
})
export class RolesComponent implements OnInit {
  readonly roleFacade = inject(RoleManagementFacadeService);
  readonly optionFacade = inject(OptionManagementFacadeService);
  private readonly alertService = inject(AlertService);
  private readonly fb = inject(FormBuilder);

  editingRoleId: number | null = null;
  selectedOptionIds: number[] = [];

  readonly roleForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    code: ['', [Validators.required, Validators.maxLength(80)]],
    description: [''],
    active: [true, Validators.required],
  });

  ngOnInit(): void {
    this.roleFacade.loadRoles().subscribe();
    this.optionFacade.loadOptions().subscribe();
  }

  toggleOption(optionId: number, checked: boolean): void {
    this.selectedOptionIds = checked
      ? [...this.selectedOptionIds, optionId]
      : this.selectedOptionIds.filter((id) => id !== optionId);
  }

  editRole(role: RoleEntity): void {
    this.editingRoleId = role.id;
    this.selectedOptionIds = [...role.optionIds];
    this.roleForm.patchValue({
      name: role.name,
      code: role.code,
      description: role.description || '',
      active: role.active,
    });
  }

  resetForm(): void {
    this.editingRoleId = null;
    this.selectedOptionIds = [];
    this.roleForm.reset({ name: '', code: '', description: '', active: true });
  }

  onSubmit(): void {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }

    const payload = {
      name: this.roleForm.value.name ?? '',
      code: this.roleForm.value.code ?? '',
      description: this.roleForm.value.description ?? '',
      active: this.roleForm.value.active ?? true,
      optionIds: this.selectedOptionIds,
    };

    const request$ = this.editingRoleId
      ? this.roleFacade.updateRole(this.editingRoleId, payload)
      : this.roleFacade.createRole(payload);

    request$.subscribe({
      next: () => {
        void this.alertService.success('Perfil guardado', this.editingRoleId ? 'El perfil fue actualizado.' : 'El perfil fue creado.');
        this.resetForm();
      },
      error: (err: unknown) => {
        const message = err instanceof Error ? err.message : 'No se pudo guardar el perfil';
        void this.alertService.error('Error', message);
      }
    });
  }

  deleteRole(role: RoleEntity): void {
    void this.alertService.confirm('Eliminar perfil', `¿Deseas eliminar el perfil ${role.name}?`, 'Sí, eliminar', 'Cancelar').then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      this.roleFacade.deleteRole(role.id).subscribe({
        next: (message) => {
          void this.alertService.success('Perfil eliminado', message);
          if (this.editingRoleId === role.id) {
            this.resetForm();
          }
        },
        error: (err: unknown) => {
          const message = err instanceof Error ? err.message : 'No se pudo eliminar el perfil';
          void this.alertService.error('Error', message);
        }
      });
    });
  }
}