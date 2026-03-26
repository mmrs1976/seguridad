import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AlertService } from '../../core/services/alert.service';
import { AuthFacadeService } from '../../core/services/auth-facade.service';
import { RoleManagementFacadeService } from '../../core/services/role-management-facade.service';
import { UserManagementFacadeService } from '../../core/services/user-management-facade.service';
import { UserEntity } from '../../domain/entities/user.entity';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <section class="users-page">
      <header class="users-header">
        <div>
          <h1>Usuarios</h1>
          <p>Gestiona activación, desactivación, perfil y eliminación de cuentas.</p>
        </div>
        <button mat-stroked-button type="button" (click)="reload()" [disabled]="userFacade.isLoading()">
          <mat-icon>refresh</mat-icon>
          Actualizar
        </button>
      </header>

      @if (userFacade.isLoading() && !userFacade.users().length) {
        <div class="loading-state">
          <mat-spinner diameter="36"></mat-spinner>
          <p>Cargando usuarios...</p>
        </div>
      } @else if (userFacade.error()) {
        <div class="feedback-card error">{{ userFacade.error() }}</div>
      } @else if (!userFacade.users().length) {
        <div class="feedback-card">No hay usuarios registrados.</div>
      } @else {
        <div class="users-table-wrapper">
          <table class="users-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Estado</th>
                <th>Perfil</th>
                <th>Verificación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (user of userFacade.users(); track user.id) {
                <tr>
                  <td>
                    <div class="user-name">{{ user.name }}</div>
                    @if (isCurrentUser(user)) {
                      <span class="self-badge">Tu sesión</span>
                    }
                  </td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span class="status-pill" [class.active]="user.active" [class.inactive]="!user.active">
                      {{ user.active ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td>
                    @if (isCurrentUser(user)) {
                      <span class="role-label">{{ user.roleName || 'Sin perfil' }}</span>
                    } @else {
                      <select
                        class="role-select"
                        [disabled]="userFacade.isLoading()"
                        (change)="onRoleChange(user, $event)"
                      >
                        @if (!user.roleId) {
                          <option value="" selected>Sin perfil</option>
                        }
                        @for (role of roleFacade.roles(); track role.id) {
                          <option [value]="role.id" [selected]="role.id === user.roleId">
                            {{ role.name }}
                          </option>
                        }
                      </select>
                    }
                  </td>
                  <td>
                    <span class="status-pill" [class.verified]="isVerified(user)" [class.pending]="!isVerified(user)">
                      {{ isVerified(user) ? 'Verificado' : 'Pendiente' }}
                    </span>
                  </td>
                  <td>
                    <div class="actions-cell">
                      <button
                        mat-stroked-button
                        type="button"
                        (click)="toggleUserActive(user)"
                        [disabled]="userFacade.isLoading() || isCurrentUser(user)"
                      >
                        {{ user.active ? 'Desactivar' : 'Activar' }}
                      </button>
                      <button
                        mat-flat-button
                        type="button"
                        class="danger-btn"
                        (click)="deleteUser(user)"
                        [disabled]="userFacade.isLoading() || isCurrentUser(user)"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `,
  styles: [`
    .users-page { padding: 1.5rem; }

    .users-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .users-header h1 { margin: 0 0 0.35rem; color: #0f172a; }
    .users-header p { margin: 0; color: #64748b; }

    .users-table-wrapper,
    .feedback-card,
    .loading-state {
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 14px 38px rgba(15, 23, 42, 0.08);
      border: 1px solid #e2e8f0;
    }

    .users-table-wrapper { overflow-x: auto; }

    .users-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 820px;
    }

    .users-table th,
    .users-table td {
      padding: 0.9rem 1rem;
      border-bottom: 1px solid #e2e8f0;
      text-align: left;
      vertical-align: middle;
    }

    .users-table th {
      color: #475569;
      font-size: 0.82rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .user-name { font-weight: 600; color: #0f172a; }

    .self-badge {
      display: inline-block;
      margin-top: 0.35rem;
      font-size: 0.75rem;
      color: #0f766e;
      background: #ccfbf1;
      padding: 0.2rem 0.5rem;
      border-radius: 999px;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.25rem 0.7rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .status-pill.active, .status-pill.verified { background: #dcfce7; color: #166534; }
    .status-pill.inactive, .status-pill.pending { background: #fee2e2; color: #991b1b; }

    .role-select {
      width: 100%;
      padding: 0.4rem 0.6rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      background: #f8fafc;
      color: #1e293b;
      font-size: 0.875rem;
      cursor: pointer;
      outline: none;
      transition: border-color 0.2s;
    }

    .role-select:hover:not(:disabled) { border-color: #0f766e; }
    .role-select:focus { border-color: #0f766e; box-shadow: 0 0 0 2px rgba(15,118,110,0.15); }
    .role-select:disabled { opacity: 0.5; cursor: not-allowed; }

    .role-label { font-size: 0.875rem; color: #475569; font-style: italic; }

    .actions-cell { display: flex; gap: 0.6rem; flex-wrap: wrap; }

    .danger-btn { background: #b91c1c !important; color: #ffffff !important; }

    .feedback-card, .loading-state { padding: 1.5rem; }
    .feedback-card.error { color: #b91c1c; }
    .loading-state { display: flex; align-items: center; gap: 1rem; color: #475569; }

    @media (max-width: 768px) {
      .users-page { padding: 1rem; }
      .users-header { flex-direction: column; }
    }
  `]
})
export class UsuariosComponent implements OnInit {
  readonly userFacade = inject(UserManagementFacadeService);
  readonly roleFacade = inject(RoleManagementFacadeService);
  readonly currentUser = inject(AuthFacadeService).currentUser;
  private readonly alertService = inject(AlertService);

  ngOnInit(): void {
    this.reload();
    if (!this.roleFacade.roles().length) {
      this.roleFacade.loadRoles().subscribe();
    }
  }

  reload(): void {
    this.userFacade.loadUsers().subscribe();
  }

  isCurrentUser(user: UserEntity): boolean {
    return this.currentUser()?.id === user.id;
  }

  isVerified(user: UserEntity): boolean {
    return !!user.emailVerifiedAt;
  }

  onRoleChange(user: UserEntity, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newRoleId = parseInt(select.value, 10);
    if (!newRoleId || newRoleId === user.roleId) return;

    const previousValue = String(user.roleId ?? '');
    const selectedRole = this.roleFacade.roles().find((r) => r.id === newRoleId);
    if (!selectedRole) return;

    void this.alertService
      .confirm(
        'Cambiar perfil',
        `¿Cambiar el perfil de "${user.name}" a "${selectedRole.name}"?`,
        'Sí, cambiar',
        'Cancelar'
      )
      .then((result) => {
        if (!result.isConfirmed) {
          select.value = previousValue;
          return;
        }

        this.userFacade.updateUserRole(user.id, newRoleId).subscribe({
          next: () => {
            void this.alertService.success(
              'Perfil actualizado',
              `${user.name} ahora tiene el perfil "${selectedRole.name}".`
            );
          },
          error: (err: unknown) => {
            select.value = previousValue;
            const message = err instanceof Error ? err.message : 'No se pudo cambiar el perfil';
            void this.alertService.error('Error al cambiar perfil', message);
          },
        });
      });
  }

  toggleUserActive(user: UserEntity): void {
    const targetActive = !user.active;
    const actionLabel = targetActive ? 'activar' : 'desactivar';

    void this.alertService
      .confirm(
        `${targetActive ? 'Activar' : 'Desactivar'} usuario`,
        `¿Deseas ${actionLabel} a ${user.name}?`,
        `Sí, ${actionLabel}`,
        'Cancelar'
      )
      .then((result) => {
        if (!result.isConfirmed) return;

        this.userFacade.updateUserActive(user.id, targetActive).subscribe({
          next: () => {
            void this.alertService.success(
              'Estado actualizado',
              targetActive
                ? 'El usuario fue activado correctamente.'
                : 'El usuario fue desactivado correctamente.'
            );
          },
          error: (err: unknown) => {
            const message = err instanceof Error ? err.message : 'No se pudo actualizar el usuario';
            void this.alertService.error('No se pudo completar la acción', message);
          },
        });
      });
  }

  deleteUser(user: UserEntity): void {
    void this.alertService
      .confirm(
        'Eliminar usuario',
        `Esta acción eliminará a ${user.name} de forma permanente.`,
        'Sí, eliminar',
        'Cancelar'
      )
      .then((result) => {
        if (!result.isConfirmed) return;

        this.userFacade.deleteUser(user.id).subscribe({
          next: (message) => {
            void this.alertService.success('Usuario eliminado', message);
          },
          error: (err: unknown) => {
            const message = err instanceof Error ? err.message : 'No se pudo eliminar el usuario';
            void this.alertService.error('No se pudo completar la acción', message);
          },
        });
      });
  }
}
