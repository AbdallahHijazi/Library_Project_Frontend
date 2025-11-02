import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const t = localStorage.getItem('authToken');
    if (!t) return next.handle(req);
    return next.handle(req.clone({ setHeaders: { Authorization: `Bearer ${t}` } }));
  }
}