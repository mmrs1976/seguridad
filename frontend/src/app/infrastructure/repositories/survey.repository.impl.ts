import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { SurveyResponseEntity } from '../../domain/entities/survey-response.entity';
import { HttpClientAdapter } from '../adapters/http/http-client.adapter';
import { environment } from '../../../environments/environment';

interface ApiSurveyResponse {
  data: Record<string, unknown> | null;
  status: 'draft' | 'submitted' | null;
  submitted_at: string | null;
}

@Injectable({ providedIn: 'root' })
export class SurveyRepositoryImpl {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly httpClient: HttpClientAdapter) {}

  getSurvey(): Observable<SurveyResponseEntity> {
    return this.httpClient.get<ApiSurveyResponse>(`${this.baseUrl}/survey`).pipe(
      map((r) => ({
        data: r.data as SurveyResponseEntity['data'],
        status: r.status,
        submittedAt: r.submitted_at,
      }))
    );
  }

  saveSurvey(data: Record<string, unknown>, submit: boolean): Observable<SurveyResponseEntity> {
    return this.httpClient.post<ApiSurveyResponse>(`${this.baseUrl}/survey`, { data, submit }).pipe(
      map((r) => ({
        data: r.data as SurveyResponseEntity['data'],
        status: r.status,
        submittedAt: r.submitted_at,
      }))
    );
  }
}
