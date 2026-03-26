import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthFacadeService } from '../../core/services/auth-facade.service';

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
  readonly currentUser = this.authFacade.currentUser;

  logout(): void {
    this.authFacade.logout();
  }
}
