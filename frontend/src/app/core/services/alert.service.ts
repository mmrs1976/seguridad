import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon, SweetAlertResult } from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private show(icon: SweetAlertIcon, title: string, text: string, confirmButtonText = 'Aceptar'): Promise<SweetAlertResult> {
    return Swal.fire({
      icon,
      title,
      text,
      confirmButtonText,
      confirmButtonColor: '#0f766e',
      background: '#ffffff',
      color: '#1f2937',
      allowOutsideClick: true,
      heightAuto: false
    });
  }

  success(title: string, text: string, confirmButtonText?: string): Promise<SweetAlertResult> {
    return this.show('success', title, text, confirmButtonText);
  }

  error(title: string, text: string, confirmButtonText?: string): Promise<SweetAlertResult> {
    return this.show('error', title, text, confirmButtonText);
  }

  info(title: string, text: string, confirmButtonText?: string): Promise<SweetAlertResult> {
    return this.show('info', title, text, confirmButtonText);
  }

  warning(title: string, text: string, confirmButtonText?: string): Promise<SweetAlertResult> {
    return this.show('warning', title, text, confirmButtonText);
  }

  confirm(title: string, text: string, confirmButtonText = 'Aceptar', cancelButtonText = 'Cancelar'): Promise<SweetAlertResult> {
    return Swal.fire({
      icon: 'question',
      title,
      text,
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText,
      confirmButtonColor: '#0f766e',
      cancelButtonColor: '#6b7280',
      background: '#ffffff',
      color: '#1f2937',
      heightAuto: false
    });
  }

  async successWithCopyPassword(title: string, text: string, password: string): Promise<SweetAlertResult> {
    const result = await Swal.fire({
      icon: 'success',
      title,
      text,
      showDenyButton: true,
      denyButtonText: 'Copiar contraseña',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#0f766e',
      denyButtonColor: '#0ea5a4',
      background: '#ffffff',
      color: '#1f2937',
      heightAuto: false
    });

    if (result.isDenied) {
      await navigator.clipboard.writeText(password);
      return Swal.fire({
        icon: 'success',
        title: 'Contraseña copiada',
        text: 'La contraseña temporal se copió al portapapeles.',
        confirmButtonColor: '#0f766e',
        background: '#ffffff',
        color: '#1f2937',
        heightAuto: false
      });
    }

    return result;
  }
}