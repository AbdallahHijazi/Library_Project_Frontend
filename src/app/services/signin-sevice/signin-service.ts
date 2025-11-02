import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegisterRequest, RegisterResponse } from '../../models/signin.model/signin.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class signinService {
 private readonly apiUrl = `${environment.apiBaseUrl}/User`; // عدّلها لو عندك environment

  constructor(private http: HttpClient) {}

  register(payload: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/add-user`, payload);
  }
}
