import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AlertService } from '../../core/services/alert.service';
import { AuthFacadeService } from '../../core/services/auth-facade.service';
import { RoleManagementFacadeService } from '../../core/services/role-management-facade.service';
import { UserManagementFacadeService } from '../../core/services/user-management-facade.service';
import { CreateUserPayload } from '../../domain/ports/user-management.repository';
import { UserEntity } from '../../domain/entities/user.entity';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <section class="users-page">
      <header class="users-header">
        <div>
          <h1>Usuarios</h1>
          <p>Gestiona activación, desactivación, perfil y eliminación de cuentas.</p>
        </div>
        <div class="header-actions">
          <button mat-flat-button type="button" class="icon-action-btn create-action" (click)="toggleCreateForm()" [disabled]="userFacade.isLoading()" [attr.aria-label]="showCreateForm ? 'Cerrar formulario' : 'Nuevo usuario'" [title]="showCreateForm ? 'Cerrar formulario' : 'Nuevo usuario'">
            <img src="/icons/add.svg" alt="Crear" class="action-icon light-icon">
          </button>
          <button mat-stroked-button type="button" class="icon-action-btn" (click)="reload()" [disabled]="userFacade.isLoading()" aria-label="Actualizar" title="Actualizar">
            <img src="/icons/refresh.svg" alt="Actualizar" class="action-icon">
          </button>
        </div>
      </header>

      @if (showCreateForm) {
        <section class="create-user-card">
          <h2>Crear usuario</h2>
          <p>Este formulario crea usuarios desde administración sin modificar el registro público.</p>

          <div class="create-grid">
            <label>
              Nombre
              <input type="text" [(ngModel)]="newUser.name" [disabled]="userFacade.isLoading()" placeholder="Nombre completo">
            </label>
            <label>
              Correo
              <input type="email" [(ngModel)]="newUser.email" [disabled]="userFacade.isLoading()" placeholder="correo@dominio.com">
            </label>
            <label>
              Contraseña (opcional)
              <input type="password" [(ngModel)]="newUser.password" [disabled]="userFacade.isLoading()" placeholder="Si la dejas vacía, se genera automática">
            </label>
            <label>
              Perfil
              <select [(ngModel)]="newUser.roleId" [disabled]="userFacade.isLoading()">
                <option [ngValue]="null">Selecciona un perfil</option>
                @for (role of roleFacade.roles(); track role.id) {
                  <option [ngValue]="role.id">{{ role.name }}</option>
                }
              </select>
            </label>
          </div>

          <div class="create-options">
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="newUser.active" [disabled]="userFacade.isLoading()">
              Crear usuario activo
            </label>
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="newUser.notifyUser" [disabled]="userFacade.isLoading()">
              Enviar correo de notificación
            </label>
          </div>

          <div class="create-actions">
            <button mat-flat-button type="button" class="icon-action-btn create-action" (click)="createUser()" [disabled]="userFacade.isLoading()" aria-label="Crear usuario" title="Crear usuario">
              <img src="/icons/add.svg" alt="Crear usuario" class="action-icon light-icon">
            </button>
            <button mat-stroked-button type="button" (click)="resetCreateForm()" [disabled]="userFacade.isLoading()">
              Limpiar
            </button>
          </div>
        </section>
      }

      <section class="search-card">
        <label>
          Buscar en usuarios
          <input
            type="search"
            [(ngModel)]="searchTerm"
            [disabled]="userFacade.isLoading()"
            placeholder="Buscar por nombre, correo o perfil"
          >
        </label>
      </section>

      @if (userFacade.isLoading() && !userFacade.users().length) {
        <div class="loading-state">
          <mat-spinner diameter="36"></mat-spinner>
          <p>Cargando usuarios...</p>
        </div>
      } @else if (userFacade.error()) {
        <div class="feedback-card error">{{ userFacade.error() }}</div>
      } @else if (!filteredUsers().length) {
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
              @for (user of filteredUsers(); track user.id) {
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
                        class="icon-action-btn"
                        (click)="toggleUserActive(user)"
                        [disabled]="userFacade.isLoading() || isCurrentUser(user)"
                        [attr.aria-label]="user.active ? 'Desactivar' : 'Activar'"
                        [title]="user.active ? 'Desactivar' : 'Activar'"
                      >
                        <img src="/icons/toggle.svg" alt="Estado" class="action-icon">
                      </button>
                      <button
                        mat-flat-button
                        type="button"
                        class="icon-action-btn danger-btn"
                        (click)="deleteUser(user)"
                        [disabled]="userFacade.isLoading() || isCurrentUser(user)"
                        aria-label="Eliminar"
                        title="Eliminar"
                      >
                        <img src="/icons/delete.svg" alt="Eliminar" class="action-icon">
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

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      flex-wrap: wrap;
    }

    .primary-btn {
      background: #0f766e !important;
      color: #ffffff !important;
    }

    .icon-action-btn {
      min-width: 42px !important;
      width: 42px;
      height: 42px;
      padding: 0 !important;
      border-radius: 10px !important;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .action-icon {
      width: 18px;
      height: 18px;
      object-fit: contain;
    }

    .light-icon {
      filter: brightness(0) saturate(100%) invert(100%);
    }

    .create-action {
      background: #0f766e !important;
      color: #ffffff !important;
    }

    .users-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .create-user-card {
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 14px 38px rgba(15, 23, 42, 0.08);
      border: 1px solid #e2e8f0;
      padding: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .create-user-card h2 {
      margin: 0 0 0.25rem;
      color: #0f172a;
      font-size: 1.1rem;
    }

    .create-user-card p {
      margin: 0 0 1rem;
      color: #64748b;
    }

    .create-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 0.85rem;
      margin-bottom: 0.85rem;
    }

    .create-grid label {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      font-size: 0.86rem;
      color: #334155;
      font-weight: 600;
    }

    .create-grid input,
    .create-grid select {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 0.55rem 0.65rem;
      color: #0f172a;
      background: #f8fafc;
      font-size: 0.9rem;
    }

    .create-grid input:focus,
    .create-grid select:focus {
      outline: none;
      border-color: #0f766e;
      box-shadow: 0 0 0 2px rgba(15, 118, 110, 0.12);
    }

    .create-options {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .checkbox-label {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.88rem;
      color: #1e293b;
    }

    .create-actions {
      display: flex;
      gap: 0.65rem;
      flex-wrap: wrap;
    }

    .search-card {
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 14px 38px rgba(15, 23, 42, 0.08);
      border: 1px solid #e2e8f0;
      padding: 1rem 1.25rem;
      margin-bottom: 1rem;
    }

    .search-card label {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      color: #334155;
      font-size: 0.86rem;
      font-weight: 600;
    }

    .search-card input {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 0.55rem 0.65rem;
      color: #0f172a;
      background: #f8fafc;
      font-size: 0.9rem;
    }

    .search-card input:focus {
      outline: none;
      border-color: #0f766e;
      box-shadow: 0 0 0 2px rgba(15, 118, 110, 0.12);
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

    .danger-btn { background: #fee2e2 !important; }

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
  showCreateForm = false;
  searchTerm = '';
  newUser: {
    name: string;
    email: string;
    password: string;
    roleId: number | null;
    active: boolean;
    notifyUser: boolean;
  } = {
    name: '',
    email: '',
    password: '',
    roleId: null,
    active: true,
    notifyUser: true,
  };

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

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.resetCreateForm();
    }
  }

  resetCreateForm(): void {
    this.newUser = {
      name: '',
      email: '',
      password: '',
      roleId: null,
      active: true,
      notifyUser: true,
    };
  }

  createUser(): void {
    if (!this.newUser.name.trim() || !this.newUser.email.trim()) {
      void this.alertService.info('Datos incompletos', 'Completa nombre y correo.');
      return;
    }

    if (this.newUser.password.trim().length > 0 && this.newUser.password.trim().length < 8) {
      void this.alertService.info('Contraseña inválida', 'La contraseña debe tener mínimo 8 caracteres.');
      return;
    }

    if (!this.newUser.roleId) {
      void this.alertService.info('Perfil requerido', 'Selecciona un perfil para el usuario.');
      return;
    }

    const payload: CreateUserPayload = {
      name: this.newUser.name.trim(),
      email: this.newUser.email.trim(),
      password: this.newUser.password.trim() || undefined,
      roleId: this.newUser.roleId,
      active: this.newUser.active,
      notifyUser: this.newUser.notifyUser,
    };

    this.userFacade.createUser(payload).subscribe({
      next: (result) => {
        const baseMessage = payload.notifyUser
          ? 'Usuario creado y correo de notificación enviado.'
          : 'Usuario creado sin envío de correo.';

        if (result.generatedPassword) {
          const details = `${baseMessage} Contraseña autogenerada: ${result.generatedPassword}`;
          void this.alertService.successWithCopyPassword('Usuario creado', details, result.generatedPassword);
        } else {
          void this.alertService.success('Usuario creado', baseMessage);
        }

        this.resetCreateForm();
        this.showCreateForm = false;
      },
      error: (err: unknown) => {
        const message = err instanceof Error ? err.message : 'No se pudo crear el usuario';
        void this.alertService.error('No se pudo crear el usuario', message);
      },
    });
  }

  filteredUsers(): UserEntity[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.userFacade.users();
    }

    return this.userFacade.users().filter((user) => {
      const name = user.name?.toLowerCase() ?? '';
      const email = user.email?.toLowerCase() ?? '';
      const role = user.roleName?.toLowerCase() ?? '';
      return name.includes(term) || email.includes(term) || role.includes(term);
    });
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
