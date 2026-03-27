import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { DashboardComponent } from './presentation/dashboard/dashboard.component';
import { AlertasComponent } from './presentation/alertas/alertas.component';
import { EncuestaComponent } from './presentation/encuesta/encuesta.component';
import { NormativasComponent } from './presentation/normativas/normativas.component';
import { OpcionesComponent } from './presentation/opciones/opciones.component';
import { ReglasComponent } from './presentation/reglas/reglas.component';
import { RolesComponent } from './presentation/roles/roles.component';
import { OrigenesComponent } from './presentation/origenes/origenes.component';
import { TransaccionesComponent } from './presentation/transacciones/transacciones.component';
import { UsuariosComponent } from './presentation/usuarios/usuarios.component';
import { HomeComponent } from './presentation/home/home.component';
import { ForgotPasswordComponent } from './presentation/login/forgot-password/forgot-password.component';
import { LoginFormComponent } from './presentation/login/login-form/login-form.component';
import { RegisterFormComponent } from './presentation/login/register-form/register-form.component';
import { ResetPasswordComponent } from './presentation/login/reset-password/reset-password.component';

// canonical router configuration for bootstrapApplication
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginFormComponent },
  { path: 'register', component: RegisterFormComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'encuesta', component: EncuestaComponent },
      { path: 'alertas', component: AlertasComponent },
      { path: 'normativas', component: NormativasComponent },
      { path: 'reglas', component: ReglasComponent },
      { path: 'transacciones', component: TransaccionesComponent },
      { path: 'origenes', component: OrigenesComponent },
      { path: 'usuarios', component: UsuariosComponent, canActivate: [AdminGuard] },
      { path: 'roles', component: RolesComponent, canActivate: [AdminGuard] },
      { path: 'opciones', component: OpcionesComponent, canActivate: [AdminGuard] }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
