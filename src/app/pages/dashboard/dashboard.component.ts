import { Component, OnInit } from '@angular/core';
import { MemberService } from '../../services/mamber-service/mamber-service';
import { CommonModule } from '@angular/common';
import { HomeComponent } from '../home/home.component';
import { finalize, forkJoin, map, Observable } from 'rxjs';
import { BookService } from '../../services/book-service/book-service';
import { BorrowService } from '../../services/borrow-service/borrow-service';
import { HttpClient } from '@angular/common/http';
import { MemberRead } from '../../models/Mamber.model/member.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, HomeComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  
  totalMembersCount: number = 0;
  availableBooksCount: number = 0;
  overdueCount: number = 0;
  currentBorrowingsCount: number = 0;
  loading: boolean = true; 
  userName: string = 'المستخدم'; 
  lastLoginDate: Date = new Date(); 
  
  constructor(private memberService: MemberService,
              private bookService: BookService,
              private borrowService: BorrowService,
              private http: HttpClient ) {} 
  ngOnInit(): void {
    this.fetchData();
    this.lastLoginDate = new Date(); 
  }

  // fetchData(): void {
  //   this.loading = true;

  //   // 1. جلب عدد الأعضاء: (نفس الكود السابق)
  //   const membersCount$ = this.memberService.getMembers().pipe(
  //     map(members => Array.isArray(members) ? members.length : 0)
  //   );

  //   // 2. جلب عدد الكتب المتاحة: (نفس الكود السابق)
  //   const availableBooksCount$ = this.bookService.getBooks({ page: 1, pageSize: 1000 }).pipe(
  //     map(pagedBooks => {
  //       return pagedBooks?.items?.reduce((total, book) => total + (book.copiesCount || 0), 0) || 0;
  //     })
  //   );
    
  //   // 🚨 3. جلب عدد الاستعارات الجارية: (الاعتماد على طول القائمة المرجعة)
  //   const currentBorrowingsCount$ = this.borrowService.getAll().pipe(
  //     map(borrowings => Array.isArray(borrowings) ? borrowings.length : 0)
  //   );
    
  //   // استخدام forkJoin لتنفيذ جميع الطلبات بالتوازي
  //   forkJoin({
  //     membersCount: membersCount$,
  //     availableBooks: availableBooksCount$,
  //     // 🚨 تحديث الاسم في forkJoin
  //     currentBorrowings: currentBorrowingsCount$ 
  //   })
  //   .pipe(finalize(() => this.loading = false))
  //   .subscribe({
  //     next: (results) => {
  //       this.totalMembersCount = results.membersCount;
  //       this.availableBooksCount = results.availableBooks;
  //       // 🚨 تحديث المتغير
  //       this.currentBorrowingsCount = results.currentBorrowings; 
  //     },
  //     error: (err) => {
  //       console.error('فشل في جلب إحصائيات لوحة التحكم', err);
  //     }
  //   });
  // }
  fetchData(): void {
    this.loading = true;

    // 1. إجمالي الأعضاء المسجلين: (يجب الوصول إلى members.length أو pagedResult.totalCount)
    const membersCount$ = this.memberService.getMembersFordashbord(1, 1000).pipe( // ⬅️ استدعاء صحيح للدالة
          map(result => {
            // نستخدم .length لأن الخطأ السابق أكد أن result هو MemberRead[]
            return Array.isArray(result) ? result.length : 0;
          })
        );

    // 2. إجمالي الكتب المتاحة: (نعتمد على مجموع نسخ الكتب)
    const availableBooksCount$ = this.bookService.getBooks({ page: 1, pageSize: 1000 }).pipe(
      map(result => {
        const books = result.items || result; // إذا كان PagedResult نستخدم items، وإلا نستخدم result بالكامل

        if (Array.isArray(books)) {
            // 🚨 نستخدم reduce لجمع عدد النسخ المتاحة (نفترض أن اسم الحقل هو copiesCount)
            return books.reduce((total, book) => total + (book.copiesCount || 0), 0);
        }
        return 0;
      })
    );
    
    // 3. إجمالي الاستعارات الجارية: (نفس منطق الحساب السابق)
    const currentBorrowingsCount$ = this.borrowService.getAll().pipe(
      map(borrowings => Array.isArray(borrowings) ? borrowings.length : 0)
    );
    
    // ... (forkJoin وبقية الـ subscription) ...
    forkJoin({
      membersCount: membersCount$,
      availableBooks: availableBooksCount$,
      currentBorrowings: currentBorrowingsCount$
    })
    .pipe(finalize(() => this.loading = false))
    .subscribe({
      next: (results) => {
        this.totalMembersCount = results.membersCount;
        this.availableBooksCount = results.availableBooks;
        this.currentBorrowingsCount = results.currentBorrowings; 
      },
      error: (err) => {
        console.error('فشل في جلب إحصائيات لوحة التحكم', err);
      }
    });
  }
}



