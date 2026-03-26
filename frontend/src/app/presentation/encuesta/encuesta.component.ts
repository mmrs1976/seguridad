import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-encuesta',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="survey-page">
      <header class="survey-header">
        <p class="eyebrow">Encuesta del Postulante</p>
        <h1>Formulario de postulación por secciones</h1>
        <p>Completa cada bloque con la información requerida antes de enviar tu solicitud.</p>
      </header>

      <div class="survey-grid">
        @for (section of sections; track section.title; let index = $index) {
          <article class="survey-card">
            <div class="section-number">{{ index + 1 }}</div>
            <h2>{{ section.title }}</h2>
            <p>{{ section.description }}</p>
            <ul>
              @for (item of section.items; track item) {
                <li>{{ item }}</li>
              }
            </ul>
          </article>
        }
      </div>
    </section>
  `,
  styles: [`
    .survey-page {
      padding: 1.5rem;
    }

    .survey-header {
      margin-bottom: 1.5rem;
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

    .survey-header h1 {
      margin: 0 0 0.5rem;
      color: #0f172a;
    }

    .survey-header p:last-child {
      margin: 0;
      color: #475569;
    }

    .survey-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
    }

    .survey-card {
      background: #ffffff;
      border-radius: 18px;
      padding: 1.25rem;
      border: 1px solid #e2e8f0;
      box-shadow: 0 14px 38px rgba(15, 23, 42, 0.08);
    }

    .section-number {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #0f766e;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      margin-bottom: 0.9rem;
    }

    .survey-card h2 {
      margin: 0 0 0.5rem;
      color: #0f172a;
      font-size: 1.05rem;
    }

    .survey-card p {
      margin: 0 0 0.75rem;
      color: #475569;
    }

    .survey-card ul {
      margin: 0;
      padding-left: 1rem;
      color: #1f2937;
      line-height: 1.6;
    }
  `]
})
export class EncuestaComponent {
  readonly sections = [
    {
      title: 'Datos Personales e Identificación',
      description: 'Esta sección valida quién es el solicitante y cómo contactarlo.',
      items: [
        'Nombres y apellidos completos.',
        'Documento de identidad y fecha de nacimiento.',
        'Género e información de contacto personal e institucional.',
        'Dirección de residencia incluyendo ciudad y código postal.',
      ],
    },
    {
      title: 'Perfil Académico',
      description: 'Aquí se mide el mérito y la trayectoria del estudiante.',
      items: [
        'Institución de procedencia y promedio general (GPA).',
        'Grado o programa al que aplica.',
        'Logros o premios y dominio de idiomas.',
      ],
    },
    {
      title: 'Situación Socioeconómica',
      description: 'Fundamental para becas basadas en necesidad financiera.',
      items: [
        'Ingresos mensuales del núcleo familiar.',
        'Número de personas a cargo y situación laboral del hogar.',
        'Tipo de vivienda y gastos mensuales fijos.',
      ],
    },
    {
      title: 'Trayectoria Extracurricular y Voluntariado',
      description: 'Las instituciones buscan perfiles integrales.',
      items: [
        'Actividades deportivas o artísticas.',
        'Participación en voluntariados, ONG o proyectos sociales.',
        'Cargos de liderazgo estudiantil o comunitario.',
      ],
    },
    {
      title: 'Documentación y Carta de Motivos',
      description: 'La parte cualitativa que vende al candidato.',
      items: [
        'Ensayo o carta de motivación.',
        'Cartas de recomendación y certificados de respaldo.',
        'Carga de adjuntos solicitados por la convocatoria.',
      ],
    },
  ];
}