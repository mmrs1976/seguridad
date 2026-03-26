import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AlertRepository } from '../../domain/ports/alert.repository';
import { AlertEntity } from '../../domain/entities/alert.entity';
import { HttpClientAdapter } from '../adapters/http/http-client.adapter';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AlertRepositoryImpl implements AlertRepository {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly httpClient: HttpClientAdapter) {}

  getAlerts(): Observable<AlertEntity[]> {
    return this.httpClient.get<AlertEntity[]>(`${this.baseUrl}/alerts`);
  }

  getAlertById(id: string): Observable<AlertEntity> {
    return this.httpClient.get<AlertEntity>(`${this.baseUrl}/alerts/${id}`);
  }
}
