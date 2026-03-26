import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { DashboardComponent } from './presentation/dashboard/dashboard.component';
import { AlertasComponent } from './presentation/alertas/alertas.component';
import { NormativasComponent } from './presentation/normativas/normativas.component';
import { ReglasComponent } from './presentation/reglas/reglas.component';
import { OrigenesComponent } from './presentation/origenes/origenes.component';
import { TransaccionesComponent } from './presentation/transacciones/transacciones.component';
import { UsuariosComponent } from './presentation/usuarios/usuarios.component';
import { HomeComponent } from './presentation/home/home.component';
import { LoginFormComponent } from './presentation/login/login-form/login-form.component';

// canonical router configuration for bootstrapApplication
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginFormComponent },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'alertas', component: AlertasComponent },
      { path: 'normativas', component: NormativasComponent },
      { path: 'reglas', component: ReglasComponent },
      { path: 'transacciones', component: TransaccionesComponent },
      { path: 'origenes', component: OrigenesComponent },
      { path: 'usuarios', component: UsuariosComponent }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
