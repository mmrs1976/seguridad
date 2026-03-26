import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HttpClientAdapter {
  constructor(private readonly http: HttpClient) {}

  get<T>(url: string, headers?: Record<string, string>): Observable<T> {
    return this.http.get<T>(url, { headers: new HttpHeaders(headers) });
  }

  post<T>(url: string, body: unknown, headers?: Record<string, string>): Observable<T> {
    return this.http.post<T>(url, body, { headers: new HttpHeaders(headers) });
  }

  put<T>(url: string, body: unknown, headers?: Record<string, string>): Observable<T> {
    return this.http.put<T>(url, body, { headers: new HttpHeaders(headers) });
  }

  delete<T>(url: string, headers?: Record<string, string>): Observable<T> {
    return this.http.delete<T>(url, { headers: new HttpHeaders(headers) });
  }
}
