import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthFacadeService } from '../../../core/services/auth-facade.service';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-forgot-password',
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
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authFacade = inject(AuthFacadeService);
  private readonly alertService = inject(AlertService);

  isLoading = false;
  message = '';

  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {}

  get email() {
    return this.forgotForm.get('email')!;
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.message = '';

    this.authFacade.forgotPassword(this.email.value ?? '').subscribe({
      next: (msg) => {
        this.message = msg;
        void this.alertService.success('Solicitud enviada', msg);
      },
      error: (err: unknown) => {
        const errorMessage = err instanceof Error ? err.message : 'No se pudo procesar la solicitud';
        void this.alertService.error('Error', errorMessage);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}
