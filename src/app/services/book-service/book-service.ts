import { Injectable } from '@angular/core';
import {  BookCreate, BookRead, PagedResult } from '../../models/book.model/book.model';
import { map, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private base = `${environment.apiBaseUrl}/Book`;

  constructor(private http: HttpClient) {}
  getBooks(opt: {
    page?: number;
    pageSize?: number;
    category?: string | null;
    minCopies?: number | null;
    maxCopies?: number | null;
  } = {}): Observable<PagedResult<BookRead>> {
    let params = new HttpParams()
      .set('page', String(opt.page ?? 1))
      .set('pageSize', String(opt.pageSize ?? 10))
      .set('exportToExcel', 'false');

    if (opt.category)            params = params.set('category', opt.category);
    if (opt.minCopies != null)   params = params.set('minCopies', String(opt.minCopies));
    if (opt.maxCopies != null)   params = params.set('maxCopies', String(opt.maxCopies));

    return this.http.get<PagedResult<BookRead>>(this.base, { params });
  }


  addBook(bookData: BookCreate): Observable<any> {
    return this.http.post<any>(this.base, bookData);
  }
  getBookById(id:string): Observable<BookRead> {
    return this.http.get<any>(`${this.base}/${id}`).pipe(map(res => res?.data ?? res));
  }
  deleteBook(bookId: string): Observable<void> {
  return this.http.delete<void>(`${this.base}/${bookId}`);
  }
  exportToExcel(opt: {
    category?: string | null;
    minCopies?: number | null;
    maxCopies?: number | null;
  } = {}) {
    let params = new HttpParams().set('exportToExcel', 'true');

    if (opt.category)            params = params.set('category', opt.category);
    if (opt.minCopies != null)   params = params.set('minCopies', String(opt.minCopies));
    if (opt.maxCopies != null)   params = params.set('maxCopies', String(opt.maxCopies));

    return this.http.get(this.base, {
      params,
      responseType: 'blob',
      observe: 'response'
    });
  }
  updateBook(id: string, body: any) {
    return this.http.put<any>(`${this.base}/${id}`, body);
  }
  normalizeYear(y: any): number | string | Date {
    if (y instanceof Date) return y;
    if (typeof y === 'number') return new Date(y, 0, 1); // سنة فقط
    if (typeof y === 'string') {
      const d = new Date(y);
      return isNaN(d.getTime()) ? y : d;
    }
    return y;
  }

}
