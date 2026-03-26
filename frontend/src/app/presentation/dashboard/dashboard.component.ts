import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthFacadeService } from '../../core/services/auth-facade.service';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>Dashboard</h1>
    @if (currentUser()) {
      <p>Bienvenido, {{ currentUser()?.name }}</p>
    }
    <button (click)="logout()">Cerrar sesión</button>
  `
})
export class DashboardComponent {
  private readonly authFacade = inject(AuthFacadeService);
  private readonly alertService = inject(AlertService);
  readonly currentUser = this.authFacade.currentUser;

  logout(): void {
    void this.alertService
      .confirm('Cerrar sesión', '¿Deseas cerrar tu sesión actual?', 'Sí, cerrar sesión', 'Cancelar')
      .then((result) => {
        if (result.isConfirmed) {
          this.authFacade.logout();
        }
      });
  }
}
