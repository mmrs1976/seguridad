import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthFacadeService } from '../../../core/services/auth-facade.service';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-reset-password',
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
    MatProgressSpinnerModule,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authFacade = inject(AuthFacadeService);
  private readonly alertService = inject(AlertService);

  isLoading = false;
  isResending = false;
  token = '';
  emailFromLink = '';
  invalidLink = false;
  hidePassword = true;
  hideConfirmPassword = true;

  resetForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    passwordConfirmation: ['', [Validators.required, Validators.minLength(8)]],
  });

  resendForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    this.emailFromLink = this.route.snapshot.queryParamMap.get('email') ?? '';

    if (this.emailFromLink) {
      this.resetForm.patchValue({ email: this.emailFromLink });
      this.resendForm.patchValue({ email: this.emailFromLink });
    }

    this.invalidLink = !this.token;
  }

  get email() {
    return this.resetForm.get('email')!;
  }

  get password() {
    return this.resetForm.get('password')!;
  }

  get passwordConfirmation() {
    return this.resetForm.get('passwordConfirmation')!;
  }

  get resendEmail() {
    return this.resendForm.get('email')!;
  }

  passwordsMatch(): boolean {
    return (this.password.value ?? '') === (this.passwordConfirmation.value ?? '');
  }

  onSubmit(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    if (!this.token || !this.passwordsMatch()) {
      void this.alertService.error('Error', 'El enlace es inválido o las contraseñas no coinciden.');
      this.invalidLink = !this.token;
      return;
    }

    this.isLoading = true;

    this.authFacade
      .resetPassword(
        this.email.value ?? '',
        this.token,
        this.password.value ?? '',
        this.passwordConfirmation.value ?? ''
      )
      .subscribe({
        next: (msg) => {
          void this.alertService.success('Contraseña actualizada', msg).then(() => {
            this.router.navigate(['/login']);
          });
        },
        error: (err: unknown) => {
          const errorMessage = err instanceof Error ? err.message : 'No se pudo restablecer la contraseña';
          void this.alertService.error('Error', errorMessage);
          this.invalidLink = true;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  resendResetLink(): void {
    if (this.resendForm.invalid) {
      this.resendForm.markAllAsTouched();
      return;
    }

    this.isResending = true;
    this.authFacade.forgotPassword(this.resendEmail.value ?? '').subscribe({
      next: (message) => {
        void this.alertService.success('Enlace reenviado', message);
      },
      error: (err: unknown) => {
        const errorMessage = err instanceof Error ? err.message : 'No se pudo reenviar el enlace';
        void this.alertService.error('Error', errorMessage);
      },
      complete: () => {
        this.isResending = false;
      },
    });
  }
}
