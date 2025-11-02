import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// تعريف الواجهات (Interfaces) للبيانات المُعادة
export interface DashboardStats {
  totalBooks: number;
  totalMembers: number;
  activeMembers: number;
  borrowedBooks: number;
  overdueBooks: number;
}

export interface BorrowingReport {
  bookId?: string; // لتقرير الكتب الأكثر استعارة
  memberId?: string; // لتقرير الأعضاء الأكثر نشاطًا
  title?: string;
  memberName?: string;
  borrowCount: number;
  dueDate?: string; // لتقرير الكتب المتأخرة
  daysLate?: number; // لتقرير الكتب المتأخرة
}

const apiUrl = `${environment.apiBaseUrl}/Reports`; 

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  constructor(private http: HttpClient) { }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${apiUrl}/dashboard-stats`);
  }

  getMostBorrowedBooks(limit: number = 10): Observable<BorrowingReport[]> {
    return this.http.get<BorrowingReport[]>(`${apiUrl}/most-borrowed-books?limit=${limit}`);
  }

  getMostActiveMembers(limit: number = 10): Observable<BorrowingReport[]> {
    return this.http.get<BorrowingReport[]>(`${apiUrl}/active-members?limit=${limit}`);
  }

  getOverdueBooks(): Observable<any[]> {
    return this.http.get<any[]>(`${apiUrl}/overdue-books`);
  }
  downloadOverduePdf() {
    return this.http.get(`${apiUrl}/overdue-books/export-pdf`, {
      observe: 'response',          
      responseType: 'blob'          
    }) as unknown as Observable<HttpResponse<Blob>>;
  }
}