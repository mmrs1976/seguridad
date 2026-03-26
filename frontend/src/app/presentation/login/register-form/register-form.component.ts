import { AfterViewInit, Component, ElementRef, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthFacadeService } from '../../../core/services/auth-facade.service';
import { environment } from '../../../../environments/environment';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  if (!password || !confirmPassword) return null;
  return password.value === confirmPassword.value ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register-form',
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
    MatDialogModule
  ],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.css'
})
export class RegisterFormComponent implements OnInit, AfterViewInit {
  // Google test site key for local/dev environments only.
  private readonly testRecaptchaSiteKey = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

  @ViewChild('successDialog') successDialog!: TemplateRef<unknown>;
  @ViewChild('captchaContainer') captchaContainer!: ElementRef<HTMLDivElement>;

  registerForm!: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  captchaBlocked = false;
  recaptchaSiteKey = environment.production
    ? environment.recaptchaSiteKey
    : (environment.recaptchaSiteKey || this.testRecaptchaSiteKey);
  usingTestRecaptcha = !environment.production && !environment.recaptchaSiteKey;
  private captchaWidgetId: number | null = null;
  private renderAttempts = 0;
  private readonly maxRenderAttempts = 30;

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authFacade = inject(AuthFacadeService);
  private readonly dialog = inject(MatDialog);

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
        recaptchaToken: ['', Validators.required]
      },
      { validators: passwordMatchValidator }
    );
  }

  ngAfterViewInit(): void {
    this.tryRenderRecaptcha();
  }

  get name() {
    return this.registerForm.get('name')!;
  }

  get email() {
    return this.registerForm.get('email')!;
  }

  get password() {
    return this.registerForm.get('password')!;
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword')!;
  }

  get recaptchaToken() {
    return this.registerForm.get('recaptchaToken')!;
  }

  get passwordMismatch(): boolean {
    return (
      this.registerForm.hasError('passwordMismatch') &&
      this.confirmPassword.touched
    );
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  private tryRenderRecaptcha(): void {
    if (!this.recaptchaSiteKey) {
      this.errorMessage = 'Falta configurar RECAPTCHA_SITE_KEY en el frontend.';
      return;
    }

    const grecaptcha = (window as any).grecaptcha;
    if (grecaptcha && this.captchaContainer && this.captchaWidgetId === null) {
      this.captchaBlocked = false;
      this.captchaWidgetId = grecaptcha.render(this.captchaContainer.nativeElement, {
        sitekey: this.recaptchaSiteKey,
        callback: (token: string) => {
          this.recaptchaToken.setValue(token);
          this.recaptchaToken.updateValueAndValidity();
        },
        'expired-callback': () => {
          this.resetRecaptchaControl();
        },
        'error-callback': () => {
          this.errorMessage = 'No se pudo validar el captcha. Intenta nuevamente.';
          this.resetRecaptchaControl();
        }
      });
      return;
    }

    this.renderAttempts += 1;
    if (this.renderAttempts <= this.maxRenderAttempts) {
      setTimeout(() => this.tryRenderRecaptcha(), 300);
      return;
    }

    this.captchaBlocked = true;
    this.errorMessage = 'No se pudo cargar reCAPTCHA. Puede estar bloqueado por AdBlock, firewall o DNS.';
  }

  onRetryCaptchaLoad(): void {
    this.errorMessage = '';
    this.captchaBlocked = false;
    this.renderAttempts = 0;
    this.captchaWidgetId = null;
    this.tryRenderRecaptcha();
  }

  private resetRecaptchaControl(): void {
    this.recaptchaToken.reset('');
    this.recaptchaToken.markAsTouched();
    this.recaptchaToken.updateValueAndValidity();
  }

  private resetRecaptchaWidget(): void {
    const grecaptcha = (window as any).grecaptcha;
    if (grecaptcha && this.captchaWidgetId !== null) {
      grecaptcha.reset(this.captchaWidgetId);
    }
    this.resetRecaptchaControl();
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    const { name, email, password, recaptchaToken } = this.registerForm.value;
    this.authFacade.register(name, email, password, recaptchaToken).subscribe({
      next: (result) => {
        this.successMessage = result.message || 'Usuario registrado exitosamente.';
        const dialogRef = this.dialog.open(this.successDialog, {
          width: '420px',
          disableClose: false
        });
        dialogRef.afterClosed().subscribe(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err: unknown) => {
        this.errorMessage = err instanceof Error ? err.message : 'Error al registrarse';
        this.resetRecaptchaWidget();
        this.isLoading = false;
      },
      complete: () => { this.isLoading = false; }
    });
  }
}
