import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AlertService } from '../../core/services/alert.service';
import { AuthFacadeService } from '../../core/services/auth-facade.service';
import { NavigationFacadeService } from '../../core/services/navigation-facade.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatButtonModule, MatIconModule],
  template: `
    <div class="shell" [class.menu-collapsed]="menuCollapsed">
      <aside class="sidebar">
        <div class="sidebar-top">
          @if (!menuCollapsed) {
            <h2>Seguridad</h2>
          }
          <button mat-icon-button type="button" (click)="toggleMenu()" aria-label="Ocultar o mostrar menú lateral">
            <mat-icon>{{ menuCollapsed ? 'chevron_right' : 'chevron_left' }}</mat-icon>
          </button>
        </div>

        <nav>
          @for (item of navigationFacade.items(); track item.id) {
            <a [routerLink]="item.route" routerLinkActive="active-link">
              <mat-icon>{{ item.icon || 'menu' }}</mat-icon>
              @if (!menuCollapsed) {
                <span>{{ item.name }}</span>
              }
            </a>
          }
        </nav>

        <button class="logout-btn" type="button" (click)="logout()" aria-label="Salir" title="Salir">
          <img src="/icons/logout.svg" alt="Salir" class="logout-icon">
          @if (!menuCollapsed) {
            <span>Salir</span>
          }
        </button>
      </aside>
      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .shell {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 260px 1fr;
      background: #f8fafc;
      transition: grid-template-columns 0.2s ease;
    }

    .shell.menu-collapsed {
      grid-template-columns: 84px 1fr;
    }

    .sidebar {
      background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
      color: #ffffff;
      padding: 1.5rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .sidebar-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .sidebar h2 {
      margin: 0;
      font-size: 1.35rem;
    }

    .sidebar nav {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1;
    }

    .sidebar a {
      color: #cbd5e1;
      text-decoration: none;
      padding: 0.75rem 0.9rem;
      border-radius: 10px;
      transition: background-color 0.2s ease, color 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.8rem;
      white-space: nowrap;
    }

    .sidebar a:hover,
    .sidebar a.active-link {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
    }

    .logout-btn {
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(239, 68, 68, 0.15);
      color: #ffffff;
      border-radius: 10px;
      padding: 0.7rem 0.85rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.65rem;
      justify-content: center;
      font-weight: 600;
      transition: background-color 0.2s ease, border-color 0.2s ease;
      width: 100%;
    }

    .logout-btn:hover {
      background: rgba(239, 68, 68, 0.25);
      border-color: rgba(255, 255, 255, 0.35);
    }

    .logout-icon {
      width: 18px;
      height: 18px;
      object-fit: contain;
    }

    .content {
      min-width: 0;
    }

    @media (max-width: 900px) {
      .shell {
        grid-template-columns: 1fr;
      }

      .shell.menu-collapsed {
        grid-template-columns: 1fr;
      }

      .sidebar {
        padding-bottom: 1rem;
      }

      .sidebar nav {
        flex-direction: row;
        flex-wrap: wrap;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  readonly navigationFacade = inject(NavigationFacadeService);
  private readonly authFacade = inject(AuthFacadeService);
  private readonly alertService = inject(AlertService);
  private readonly router = inject(Router);

  menuCollapsed = false;

  ngOnInit(): void {
    this.navigationFacade.loadNavigation().subscribe({
      next: () => {
        this.redirectIfNeeded();
      },
      error: () => {
        this.redirectIfNeeded();
      }
    });
  }

  toggleMenu(): void {
    this.menuCollapsed = !this.menuCollapsed;
  }

  logout(): void {
    void this.alertService
      .confirm('Cerrar sesión', '¿Deseas cerrar tu sesión actual?', 'Sí, salir', 'Cancelar')
      .then((result) => {
        if (result.isConfirmed) {
          this.authFacade.logout();
        }
      });
  }

  private redirectIfNeeded(): void {
    const user = this.authFacade.currentUser();
    if (!user) {
      return;
    }

    if (user.roleCode === 'applicant' && this.router.url !== '/home/encuesta') {
      this.router.navigate(['/home/encuesta']);
      return;
    }

    if (this.router.url === '/home' || this.router.url === '/home/') {
      const target = user.roleCode === 'applicant' ? '/home/encuesta' : '/home/dashboard';
      this.router.navigate([target]);
    }
  }
}
