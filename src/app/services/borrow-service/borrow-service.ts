import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { Borrow, BorrowingRead } from "../../models/borrow.model/borrow.model";
import { Borrowing } from "../../models/Mamber.model/member.model";
import { PagedResult } from "../../models/book.model/book.model";


@Injectable({ providedIn: 'root' })
export class BorrowService {
  private apiUrl = `${environment.apiBaseUrl}/Borrowing`; 
  private apiUrlMember = `${environment.apiBaseUrl}/Member`; 

  constructor(private http: HttpClient) {}

  getAll(opt: { page?: number; pageSize?: number } = {}): Observable<PagedResult<BorrowingRead>> {
    let params = new HttpParams()
      .set('page', String(opt.page ?? 1))
      .set('pageSize', String(opt.pageSize ?? 10));

    return this.http.get<PagedResult<BorrowingRead>>(`${this.apiUrl}`, { params });
  }
  borrow(payload: { memberId: string; bookId: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, payload);
  }
  borrowBook(borrowData: Borrow): Observable<any> {
    return this.http.post<any>(this.apiUrl, borrowData); 
  }
  getBorrowingsByMember(memberId: string): Observable<Borrowing[]> {
    return this.http.get<any>(`${this.apiUrlMember}/${memberId}`).pipe(
      map(member => {
        const borrows = Array.isArray(member?.borrowings)
          ? member.borrowings
          : member?.borrowingReads || []; // حسب DTO عندك
        // طَبِّع إلى BorrowingRead
        return (borrows as any[]).map(b => ({
          id: b.id,
          bookId: b.bookId,
          bookTitle: b.bookTitle || b.book?.title || 'كتاب',
          borrowDate: b.borrowDate,
          returnDate: b.returnDate
        } as Borrowing));
      })
    );
  }
  deleteBorrowing(borrowingId: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${borrowingId}`);
  }
  update(id: string, payload: Borrow) {
    return this.http.put<BorrowingRead>(`${this.apiUrl}/${id}`, payload);
  }
  toInput(dt?: string | null): string {
    if (!dt) return new Date().toISOString().slice(0, 16);
    try { return new Date(dt).toISOString().slice(0, 16); }
    catch { return new Date().toISOString().slice(0, 16); }
  }
}
