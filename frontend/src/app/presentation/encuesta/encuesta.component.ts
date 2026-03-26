import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { AlertService } from '../../core/services/alert.service';
import { SurveyFacadeService } from '../../core/services/survey-facade.service';

@Component({
  selector: 'app-encuesta',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <section class="survey-page">
      <header class="survey-header">
        <p class="eyebrow">Encuesta del Postulante</p>
        <h1>Formulario de Postulación</h1>
        <p>Completa cada sección. Puedes guardar tu progreso en cualquier momento.</p>
      </header>

      @if (surveyFacade.isLoading()) {
        <div class="loading-state">
          <mat-spinner diameter="36"></mat-spinner>
          <p>Cargando encuesta...</p>
        </div>
      } @else if (isSubmitted()) {
        <div class="submitted-card">
          <mat-icon class="submitted-icon">task_alt</mat-icon>
          <h2>¡Encuesta enviada!</h2>
          <p>Tu formulario de postulación fue registrado correctamente. Recibirás una notificación con el resultado del proceso.</p>
        </div>
      } @else {
        <!-- Step indicator -->
        <div class="step-indicator">
          @for (step of stepMeta; track step.num; let last = $last) {
            <button
              type="button"
              class="step-btn"
              [class.active]="currentStep() === step.num"
              [class.done]="currentStep() > step.num"
              (click)="goToStep(step.num)"
            >
              <div class="step-circle">
                @if (currentStep() > step.num) {
                  <mat-icon>check</mat-icon>
                } @else {
                  {{ step.num }}
                }
              </div>
              <span class="step-title">{{ step.label }}</span>
            </button>
            @if (!last) {
              <div class="step-connector" [class.done]="currentStep() > step.num"></div>
            }
          }
        </div>

        <!-- Form -->
        <form [formGroup]="form" class="survey-form" autocomplete="off">

          <!-- Sección 1: Datos Personales -->
          @if (currentStep() === 1) {
            <div class="form-section" formGroupName="section1">
              <h2>Datos Personales e Identificación</h2>
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Nombres</mat-label>
                  <input matInput formControlName="nombres">
                  <mat-error>Campo requerido</mat-error>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Apellidos</mat-label>
                  <input matInput formControlName="apellidos">
                  <mat-error>Campo requerido</mat-error>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Documento de identidad</mat-label>
                  <input matInput formControlName="documento">
                  <mat-error>Campo requerido</mat-error>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Fecha de nacimiento</mat-label>
                  <input matInput type="date" formControlName="fechaNacimiento">
                  <mat-error>Campo requerido</mat-error>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Género</mat-label>
                  <mat-select formControlName="genero">
                    <mat-option value="masculino">Masculino</mat-option>
                    <mat-option value="femenino">Femenino</mat-option>
                    <mat-option value="no_binario">No binario</mat-option>
                    <mat-option value="prefiero_no_decir">Prefiero no decir</mat-option>
                  </mat-select>
                  <mat-error>Campo requerido</mat-error>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Teléfono de contacto</mat-label>
                  <input matInput formControlName="telefono">
                  <mat-error>Campo requerido</mat-error>
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Dirección de residencia</mat-label>
                  <input matInput formControlName="direccion">
                  <mat-error>Campo requerido</mat-error>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Ciudad</mat-label>
                  <input matInput formControlName="ciudad">
                  <mat-error>Campo requerido</mat-error>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Código postal (opcional)</mat-label>
                  <input matInput formControlName="codigoPostal">
                </mat-form-field>
              </div>
            </div>
          }

          <!-- Sección 2: Perfil Académico -->
          @if (currentStep() === 2) {
            <div class="form-section" formGroupName="section2">
              <h2>Perfil Académico</h2>
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Institución de procedencia</mat-label>
                  <input matInput formControlName="institucion">
                  <mat-error>Campo requerido</mat-error>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Promedio general (GPA, escala 0–10)</mat-label>
                  <input matInput type="number" step="0.1" min="0" max="10" formControlName="promedio">
                  <mat-error>Requerido (0–10)</mat-error>
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Grado o programa al que aplica</mat-label>
                  <input matInput formControlName="programa">
                  <mat-error>Campo requerido</mat-error>
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Logros o premios obtenidos (opcional)</mat-label>
                  <textarea matInput formControlName="logros" rows="3"></textarea>
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Idiomas que domina (opcional)</mat-label>
                  <input matInput formControlName="idiomas" placeholder="Ej: Español, Inglés B2, Francés A1">
                </mat-form-field>
              </div>
            </div>
          }

          <!-- Sección 3: Situación Socioeconómica -->
          @if (currentStep() === 3) {
            <div class="form-section" formGroupName="section3">
              <h2>Situación Socioeconómica</h2>
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Ingresos mensuales del hogar (COP)</mat-label>
                  <input matInput type="number" min="0" formControlName="ingresosFamiliares">
                  <mat-error>Campo requerido</mat-error>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Número de personas a cargo</mat-label>
                  <input matInput type="number" min="0" formControlName="personasACargo">
                  <mat-error>Campo requerido</mat-error>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Situación laboral del hogar</mat-label>
                  <mat-select formControlName="situacionLaboral">
                    <mat-option value="empleado_completo">Empleado tiempo completo</mat-option>
                    <mat-option value="empleado_parcial">Empleado tiempo parcial</mat-option>
                    <mat-option value="desempleado">Desempleado</mat-option>
                    <mat-option value="pensionado">Pensionado / Jubilado</mat-option>
                    <mat-option value="independiente">Trabajador independiente</mat-option>
                    <mat-option value="otro">Otro</mat-option>
                  </mat-select>
                  <mat-error>Campo requerido</mat-error>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Tipo de vivienda</mat-label>
                  <mat-select formControlName="tipoVivienda">
                    <mat-option value="propia">Propia</mat-option>
                    <mat-option value="arrendada">Arrendada</mat-option>
                    <mat-option value="familiar">Familiar</mat-option>
                    <mat-option value="otro">Otro</mat-option>
                  </mat-select>
                  <mat-error>Campo requerido</mat-error>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Gastos mensuales fijos (COP)</mat-label>
                  <input matInput type="number" min="0" formControlName="gastosMensuales">
                  <mat-error>Campo requerido</mat-error>
                </mat-form-field>
              </div>
            </div>
          }

          <!-- Sección 4: Trayectoria Extracurricular -->
          @if (currentStep() === 4) {
            <div class="form-section" formGroupName="section4">
              <h2>Trayectoria Extracurricular y Voluntariado</h2>
              <div class="form-grid">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Actividades deportivas o artísticas (opcional)</mat-label>
                  <textarea matInput formControlName="actividadesDeportivas" rows="4" placeholder="Describe tus actividades..."></textarea>
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Voluntariados, ONG o proyectos sociales (opcional)</mat-label>
                  <textarea matInput formControlName="voluntariados" rows="4" placeholder="Describe tu participación..."></textarea>
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Cargos de liderazgo estudiantil o comunitario (opcional)</mat-label>
                  <textarea matInput formControlName="cargosLiderazgo" rows="4" placeholder="Describe tus roles de liderazgo..."></textarea>
                </mat-form-field>
              </div>
            </div>
          }

          <!-- Sección 5: Documentación -->
          @if (currentStep() === 5) {
            <div class="form-section" formGroupName="section5">
              <h2>Documentación y Carta de Motivos</h2>
              <div class="form-grid">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Carta de motivación (mínimo 100 caracteres)</mat-label>
                  <textarea matInput formControlName="cartaMotivacion" rows="8" placeholder="Escribe tu carta de motivación..."></textarea>
                  @if (s5.get('cartaMotivacion')?.hasError('required') && s5.get('cartaMotivacion')?.touched) {
                    <mat-error>La carta de motivación es requerida</mat-error>
                  }
                  @if (s5.get('cartaMotivacion')?.hasError('minlength') && s5.get('cartaMotivacion')?.touched) {
                    <mat-error>Debe tener al menos 100 caracteres</mat-error>
                  }
                  <mat-hint align="end">{{ s5.get('cartaMotivacion')?.value?.length ?? 0 }} / 100 mín.</mat-hint>
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Cartas de recomendación (opcional)</mat-label>
                  <textarea matInput formControlName="cartasRecomendacion" rows="4" placeholder="Nombres e instituciones de quienes te recomiendan..."></textarea>
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Notas adicionales (opcional)</mat-label>
                  <textarea matInput formControlName="notasAdicionales" rows="3"></textarea>
                </mat-form-field>
              </div>
            </div>
          }
        </form>

        <!-- Navigation -->
        <div class="form-nav">
          <button mat-stroked-button type="button" (click)="prevStep()" [disabled]="currentStep() === 1">
            <mat-icon>arrow_back</mat-icon> Anterior
          </button>
          <div class="nav-actions">
            <button mat-stroked-button type="button" (click)="saveDraft()" [disabled]="surveyFacade.isSaving()">
              @if (surveyFacade.isSaving()) {
                <mat-spinner diameter="16" class="inline-spinner"></mat-spinner>
              } @else {
                <mat-icon>save</mat-icon>
              }
              Guardar borrador
            </button>
            @if (currentStep() < totalSteps) {
              <button mat-flat-button type="button" class="primary-btn" (click)="nextStep()">
                Siguiente <mat-icon>arrow_forward</mat-icon>
              </button>
            } @else {
              <button mat-flat-button type="button" class="primary-btn" (click)="submit()" [disabled]="surveyFacade.isSaving()">
                <mat-icon>send</mat-icon> Enviar encuesta
              </button>
            }
          </div>
        </div>
      }
    </section>
  `,
  styles: [`
    .survey-page { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }

    .survey-header {
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      padding: 1.5rem;
      box-shadow: 0 14px 38px rgba(15, 23, 42, 0.08);
    }

    .eyebrow {
      margin: 0 0 0.35rem;
      color: #0f766e;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 0.8rem;
      font-weight: 700;
    }

    .survey-header h1 { margin: 0 0 0.5rem; color: #0f172a; }
    .survey-header p:last-child { margin: 0; color: #475569; }

    /* Step indicator */
    .step-indicator {
      display: flex;
      align-items: center;
      gap: 0;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      padding: 1.25rem 1.5rem;
      box-shadow: 0 14px 38px rgba(15, 23, 42, 0.08);
      overflow-x: auto;
    }

    .step-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      min-width: 72px;
      transition: opacity 0.2s;
    }

    .step-btn:hover { opacity: 0.85; }

    .step-circle {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 2px solid #cbd5e1;
      background: #ffffff;
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.95rem;
      transition: all 0.25s;
    }

    .step-circle mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }

    .step-btn.active .step-circle {
      background: #0f766e;
      border-color: #0f766e;
      color: #ffffff;
    }

    .step-btn.done .step-circle {
      background: #ccfbf1;
      border-color: #0f766e;
      color: #0f766e;
    }

    .step-title {
      font-size: 0.72rem;
      color: #94a3b8;
      text-align: center;
      line-height: 1.2;
      max-width: 70px;
    }

    .step-btn.active .step-title,
    .step-btn.done .step-title { color: #0f766e; }

    .step-connector {
      flex: 1;
      height: 2px;
      background: #e2e8f0;
      min-width: 16px;
      transition: background 0.25s;
    }

    .step-connector.done { background: #0f766e; }

    /* Form */
    .survey-form {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      padding: 1.75rem;
      box-shadow: 0 14px 38px rgba(15, 23, 42, 0.08);
    }

    .form-section h2 {
      margin: 0 0 1.25rem;
      color: #0f172a;
      font-size: 1.1rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 1rem;
    }

    .form-grid .full-width { grid-column: 1 / -1; }

    mat-form-field { width: 100%; }

    /* Navigation */
    .form-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      padding: 1rem 1.5rem;
      box-shadow: 0 14px 38px rgba(15, 23, 42, 0.08);
    }

    .nav-actions { display: flex; gap: 0.75rem; align-items: center; }

    .primary-btn {
      background: #0f766e !important;
      color: #ffffff !important;
    }

    .inline-spinner {
      display: inline-block;
      vertical-align: middle;
      margin-right: 0.35rem;
    }

    /* Submitted */
    .submitted-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      padding: 3rem 2rem;
      box-shadow: 0 14px 38px rgba(15, 23, 42, 0.08);
      text-align: center;
    }

    .submitted-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #0f766e;
      margin-bottom: 1rem;
    }

    .submitted-card h2 { color: #0f172a; margin: 0 0 0.75rem; }
    .submitted-card p { color: #475569; margin: 0; max-width: 480px; margin-inline: auto; }

    /* Loading */
    .loading-state {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      padding: 1.5rem;
      box-shadow: 0 14px 38px rgba(15, 23, 42, 0.08);
      display: flex;
      align-items: center;
      gap: 1rem;
      color: #475569;
    }

    @media (max-width: 640px) {
      .survey-page { padding: 1rem; }
      .form-grid { grid-template-columns: 1fr; }
      .form-grid .full-width { grid-column: 1; }
      .survey-form { padding: 1.25rem; }
      .step-title { display: none; }
    }
  `]
})
export class EncuestaComponent implements OnInit {
  readonly surveyFacade = inject(SurveyFacadeService);
  private readonly alertService = inject(AlertService);

  readonly currentStep = signal(1);
  readonly totalSteps = 5;

  readonly stepMeta = [
    { num: 1, label: 'Datos\nPersonales' },
    { num: 2, label: 'Perfil\nAcadémico' },
    { num: 3, label: 'Socio-\neconómico' },
    { num: 4, label: 'Extra-\ncurricular' },
    { num: 5, label: 'Documentación' },
  ];

  readonly form = new FormGroup({
    section1: new FormGroup({
      nombres:         new FormControl('', Validators.required),
      apellidos:       new FormControl('', Validators.required),
      documento:       new FormControl('', Validators.required),
      fechaNacimiento: new FormControl('', Validators.required),
      genero:          new FormControl('', Validators.required),
      telefono:        new FormControl('', Validators.required),
      direccion:       new FormControl('', Validators.required),
      ciudad:          new FormControl('', Validators.required),
      codigoPostal:    new FormControl(''),
    }),
    section2: new FormGroup({
      institucion: new FormControl('', Validators.required),
      promedio:    new FormControl<number | null>(null, [Validators.required, Validators.min(0), Validators.max(10)]),
      programa:    new FormControl('', Validators.required),
      logros:      new FormControl(''),
      idiomas:     new FormControl(''),
    }),
    section3: new FormGroup({
      ingresosFamiliares: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
      personasACargo:     new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
      situacionLaboral:   new FormControl('', Validators.required),
      tipoVivienda:       new FormControl('', Validators.required),
      gastosMensuales:    new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    }),
    section4: new FormGroup({
      actividadesDeportivas: new FormControl(''),
      voluntariados:         new FormControl(''),
      cargosLiderazgo:       new FormControl(''),
    }),
    section5: new FormGroup({
      cartaMotivacion:     new FormControl('', [Validators.required, Validators.minLength(100)]),
      cartasRecomendacion: new FormControl(''),
      notasAdicionales:    new FormControl(''),
    }),
  });

  readonly isSubmitted = computed(() => this.surveyFacade.survey()?.status === 'submitted');

  get s5(): FormGroup {
    return this.form.get('section5') as FormGroup;
  }

  ngOnInit(): void {
    this.surveyFacade.loadSurvey().subscribe({
      next: (survey) => {
        if (!survey.data) return;
        const keys: Array<keyof typeof survey.data> = ['section1', 'section2', 'section3', 'section4', 'section5'];
        keys.forEach((key) => {
          const data = survey.data?.[key];
          if (data) (this.form.get(key) as FormGroup).patchValue(data as Record<string, unknown>);
        });
      },
    });
  }

  goToStep(step: number): void {
    this.currentStep.set(step);
  }

  prevStep(): void {
    if (this.currentStep() > 1) this.currentStep.update((s) => s - 1);
  }

  nextStep(): void {
    const key = `section${this.currentStep()}`;
    const group = this.form.get(key) as FormGroup;
    if (group.invalid) {
      group.markAllAsTouched();
      void this.alertService.info('Sección incompleta', 'Completa los campos requeridos antes de continuar.');
      return;
    }
    if (this.currentStep() < this.totalSteps) this.currentStep.update((s) => s + 1);
  }

  saveDraft(): void {
    const data = this.form.getRawValue() as unknown as Record<string, unknown>;
    this.surveyFacade.saveSurvey(data, false).subscribe({
      next: () => void this.alertService.success('Borrador guardado', 'Tu progreso fue guardado correctamente.'),
      error: (err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Error al guardar';
        void this.alertService.error('Error', msg);
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      void this.alertService.info(
        'Formulario incompleto',
        'Por favor revisa y completa todos los campos requeridos en cada sección.'
      );
      return;
    }

    void this.alertService
      .confirm(
        'Enviar encuesta',
        '¿Estás seguro de enviar tu encuesta? Una vez enviada no podrás modificarla.',
        'Sí, enviar',
        'Cancelar'
      )
      .then((result) => {
        if (!result.isConfirmed) return;
        const data = this.form.getRawValue() as unknown as Record<string, unknown>;
        this.surveyFacade.saveSurvey(data, true).subscribe({
          error: (err: unknown) => {
            const msg = err instanceof Error ? err.message : 'Error al enviar la encuesta';
            void this.alertService.error('Error', msg);
          },
        });
      });
  }
}

