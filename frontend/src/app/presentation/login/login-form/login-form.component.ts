import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthFacadeService } from '../../../core/services/auth-facade.service';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css'
})
export class LoginFormComponent implements OnInit {
  loginForm!: FormGroup;
  hidePassword = true;
  isLoading = false;
  errorMessage = '';
  infoMessage = '';
  canResendActivation = false;

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authFacade = inject(AuthFacadeService);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  get email() {
    return this.loginForm.get('email')!;
  }

  get password() {
    return this.loginForm.get('password')!;
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.infoMessage = '';
    this.canResendActivation = false;
    const { email, password } = this.loginForm.value;
    this.authFacade.login(email, password).subscribe({
      next: () => this.router.navigate(['/home']),
      error: (err: unknown) => {
        this.errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
        this.canResendActivation = this.errorMessage.toLowerCase().includes('inactiva');
        this.isLoading = false;
      },
      complete: () => { this.isLoading = false; }
    });
  }

  onResendActivation(): void {
    if (this.email.invalid) {
      this.email.markAsTouched();
      this.errorMessage = 'Ingresa un correo electrónico válido para reenviar activación.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.infoMessage = '';

    this.authFacade.resendActivation(this.email.value).subscribe({
      next: (message) => {
        this.infoMessage = message;
      },
      error: (err: unknown) => {
        this.errorMessage = err instanceof Error ? err.message : 'Error al reenviar activación';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
