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
            @if (item.isGroup) {
              <section class="menu-group">
                <button type="button" class="group-title" (click)="toggleGroup(item.id)" [attr.aria-expanded]="isGroupExpanded(item.id)">
                  <mat-icon>{{ item.icon || 'folder' }}</mat-icon>
                  @if (!menuCollapsed) {
                    <span>{{ item.name }}</span>
                    <span class="group-spacer"></span>
                    <mat-icon class="group-chevron">{{ isGroupExpanded(item.id) ? 'expand_less' : 'expand_more' }}</mat-icon>
                  }
                </button>

                @if (!menuCollapsed && isGroupExpanded(item.id)) {
                  @for (child of item.children ?? []; track child.id) {
                    <a [routerLink]="child.route || '/home/dashboard'" routerLinkActive="active-link" class="child-link">
                      <mat-icon>{{ child.icon || 'menu' }}</mat-icon>
                      <span>{{ child.name }}</span>
                    </a>
                  }
                }
              </section>
            } @else {
              <a [routerLink]="item.route || '/home/dashboard'" routerLinkActive="active-link">
                <mat-icon>{{ item.icon || 'menu' }}</mat-icon>
                @if (!menuCollapsed) {
                  <span>{{ item.name }}</span>
                }
              </a>
            }
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

    .menu-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .group-title {
      color: #94a3b8;
      background: transparent;
      border: 0;
      width: 100%;
      cursor: pointer;
      text-align: left;
      padding: 0.7rem 0.9rem;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      font-size: 0.75rem;
    }

    .group-title:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #cbd5e1;
    }

    .group-spacer {
      flex: 1;
    }

    .group-chevron {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .child-link {
      margin-left: 0.75rem;
    }

    .shell.menu-collapsed .child-link {
      margin-left: 0;
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
  private readonly expandedGroups: Record<number, boolean> = {};

  ngOnInit(): void {
    this.navigationFacade.loadNavigation().subscribe({
      next: () => {
        this.initializeGroupsState();
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

  toggleGroup(groupId: number): void {
    this.expandedGroups[groupId] = !this.isGroupExpanded(groupId);
  }

  isGroupExpanded(groupId: number): boolean {
    return this.expandedGroups[groupId] !== false;
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

  private initializeGroupsState(): void {
    const items = this.navigationFacade.items();
    for (const item of items) {
      if (item.isGroup && this.expandedGroups[item.id] === undefined) {
        this.expandedGroups[item.id] = true;
      }
    }
  }
}
