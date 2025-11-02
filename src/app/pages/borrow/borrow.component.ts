// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { BookRead, Borrow, BorrowingRead, BorrowView } from '../../models/borrow.model/borrow.model';
// import { HomeComponent } from '../home/home.component';
// import { BookService } from '../../services/book-service/book-service';
// import { BorrowService } from '../../services/borrow-service/borrow-service';
// import { finalize, forkJoin } from 'rxjs';
// import { MemberService } from '../../services/mamber-service/mamber-service';
// import { MemberRead } from '../../models/Mamber.model/member.model';
// import { PermissionService } from '../../core/permissions/permission.service';

// type ModalType = 'none' | 'borrow' | 'return'| 'edit';


// @Component({
//   selector: 'app-borrow',
//   standalone: true,
//   imports: [CommonModule, FormsModule,HomeComponent],
//   templateUrl: './borrow.component.html',
//   styleUrls: ['./borrow.component.css'],
// })
// export class BorrowComponent {
//   constructor(private bookService: BookService,
//               private borrowService: BorrowService,
//               private memberService:MemberService ,
//               public permissionService:PermissionService) {}
//   loading = false;
//   errorMsg = '';

//   search = '';
//   onlyActive = false;

//   members :MemberRead[] = [];
//   borrowings: BorrowingRead[] = [];   
//   borrowing: BorrowingRead[] = [];   
//   filtered: BorrowingRead[] = [];

//   books: Array<{id: string; title: string}> = []; 

//   selectedBorrowingId: string | null = null;
//   selectedMemberId: string | null = null;
//   selectedBookId: string | null = null;
//   borrowDate: string = new Date().toISOString().slice(0,16);
//   returnDate: string = new Date().toISOString().slice(0,16);

//   borrowEdit: {
//   id: string | null;
//   memberId: string | null;
//   memberName: string;   // للعرض فقط
//   bookId: string | null;
//   bookTitle: string;    // للعرض فقط
//   borrowDate: string;
//   returnDate: string;   // اسمح تكون '' لو بدك تتركها فاضية
//   } = {
//     id: null,
//     memberId: null,
//     memberName: '',
//     bookId: null,
//     bookTitle: '',
//     borrowDate: '',
//     returnDate: ''
//   };
//   ui = { modal: <ModalType>'none' };

  
//   ngOnInit(): void {
//     this.loadData();
//     this.applyFilter();
//   }
//   loadData(): void {
//     this.loading = true;
//     this.errorMsg = '';
//     this.borrowService.getAll({ page: 1, pageSize: 100 }).subscribe({
//       next: (borrowsPaged) => {
//         this.borrowings = borrowsPaged?.items ?? [];
//         this.applyFilter();
//         this.loading = false;
//       },
//       error: (err) => {
//         this.loading = false;
//         this.errorMsg = 'فشل في تحميل الاستعارات';
//         console.error('loadData error', err);
//       },
//     });
//   }
//   loadModalData(): void {
//     // إذا كانت البيانات محملة مسبقًا، لا نحتاج لتحميلها مرة أخرى
//     if (this.members.length > 0 && this.books.length > 0) {
//         return;
//     }
    
//     this.loading = true;
//     this.errorMsg = '';
    
//     // استخدام forkJoin لتحميل القائمتين معًا بكفاءة
//     forkJoin({
//         booksPaged: this.bookService.getBooks({ page: 1, pageSize: 100 }), // نحتاج فقط ID و Title
//         membersList: this.memberService.getMembers() // يجب أن يعود قائمة Array<MemberRead>
//     })
//     .pipe(finalize(() => (this.loading = false)))
//     .subscribe({
//         next: ({ booksPaged, membersList }) => {
//             // 🚨 تحديث قائمة الكتب: نحتاج فقط id و title
//             this.books = booksPaged?.items?.map(b => ({ id: b.id, title: b.title })) ?? [];
            
//             // 🚨 تحديث قائمة الأعضاء
//             this.members = Array.isArray(membersList) ? membersList : [];
//         },
//         error: (err) => {
//             console.error('Error loading modal data', err);
//             this.errorMsg = 'فشل في جلب بيانات الكتب والأعضاء للمودال.';
//         }
//     });
//   }

//   loadMembers(): void {
//       this.loading = true;
//       this.errorMsg = '';
//       this.memberService.getMembers()
//         .pipe(finalize(() => (this.loading = false)))
//         .subscribe({
//           next: (list) => {
//             this.members = Array.isArray(list) ? list : [];
//             this.applyFilter();
//           },
//           error: (err) => {
//             console.error('Error loading members', err);
//             this.errorMsg = 'فشل في جلب الأعضاء.';
//           }
//         });
//   }
//   applyFilter(): void {
//     const q = (this.search || '').trim().toLowerCase();
//     let data = [...this.borrowings];

//     if (q) {
//       data = data.filter(b =>
//         (b.memberName?.toLowerCase().includes(q)) ||
//         (b.bookTitle?.toLowerCase().includes(q))
//       );
//     }
//     if (this.onlyActive) {
//       data = data.filter(b => !b.returnDate);
//     }
//     this.filtered = data;
//   }

//   openBorrowModal(): void {
//     this.loadModalData();
//     this.ui.modal = 'borrow';
//   }

//   openReturnModal(b?: BorrowingRead ): void {
//     if (b) this.selectedBorrowingId = b.id;
//     this.ui.modal = 'return';
//   }

//   closeModal(): void {
//     this.ui.modal = 'none';
//     // لا تفرّغ selectedBorrowingId إذا تحب تبقيه
//   }

//   onBackdropClick(e: MouseEvent) {
//     if (e.target === e.currentTarget) this.closeModal();
//   }
//   submitBorrow(): void {
//     if (!this.selectedMemberId || !this.selectedBookId) {
//       alert('الرجاء اختيار عضو وكتاب');
//       return;
//     }

//     const formattedBorrowDate = new Date(this.borrowDate).toISOString();
//     const formattedReturnDate = this.returnDate 
//         ? new Date(this.returnDate).toISOString() 
//         : null; 

//     const newBorrow: Borrow = {
//       memberId: this.selectedMemberId,
//       bookId: this.selectedBookId,
//       borrowDate: formattedBorrowDate, // الآن بتنسيق ISO 8601
//       returnDate: formattedReturnDate  // الآن null أو بتنسيق ISO 8601
//     };
    
//     this.loading = true; 
//     this.errorMsg = ''; 

//     this.borrowService.borrowBook(newBorrow)
//     .pipe(finalize(() => {
//       this.loading = false;
//       this.closeModal();
//     }))
//     .subscribe({
//       error: (err) => {
//           this.loading = false;
//           let serverMessage = 'فشل في إضافة الاستعارة (400). الرجاء التحقق من البيانات.';
//           console.error('CREATE BORROW error', err);
//           if (err.error) {
//               console.error('Server Validation Details (JSON):', JSON.stringify(err.error, null, 2));
//               const serverError = err.error;
              
//               if (serverError.message) {
//                   serverMessage = serverError.message;
//               } else if (serverError.errors) {
//                   const fieldErrors = serverError.errors;
//                   let detail = 'حقول غير صالحة: ';
//                   for (const key in fieldErrors) {
//                       if (fieldErrors.hasOwnProperty(key)) {
//                           detail += `[${key}: ${fieldErrors[key].join(' | ')}] `;
//                       }
//                   }
//                   serverMessage = detail;
//               } else if (typeof serverError === 'string') {
//                   serverMessage = serverError;
//               }
//           }
//           this.errorMsg = serverMessage; 
//         }
//     });
//   }
//   confirmReturn(): void {
//     if (!this.selectedBorrowingId) return;

//     this.loading = true;

//     this.borrowService.deleteBorrowing(this.selectedBorrowingId).subscribe({
//       next: () => {
//         // حذف من الواجهة بعد التأكيد من الداتابيس
//         this.borrowings = this.borrowings.filter(b => b.id !== this.selectedBorrowingId);
//         this.applyFilter();

//         this.selectedBorrowingId = null;
//         this.loading = false;
//         this.closeModal();
//       },
//       error: (err) => {
//         this.loading = false;
//         this.errorMsg = 'فشل في حذف الاستعارة من الخادم';
//         console.error('DELETE /borrowings/{id} error', err);
//       }
//     });
//   }
//   openEditModal(b:  BorrowingRead): void {
//     this.borrowEdit.id = b.id;
//     this.borrowEdit.memberId   = b.memberId ?? null;
//     this.borrowEdit.bookId     = b.bookId ?? null;

//     // ✅ أعطِ قيمًا مضمونة من النوع string
//     this.borrowEdit.memberName = (b.memberName ?? b.memberId ?? '').toString();
//     this.borrowEdit.bookTitle  = (b.bookTitle  ?? b.bookId  ?? '').toString();

//     // التواريخ بصيغة مناسبة لـ datetime-local
//     this.borrowEdit.borrowDate = this.borrowService.toInput(b.borrowDate || new Date().toISOString());
//     this.borrowEdit.returnDate = b.returnDate ? this.borrowService.toInput(b.returnDate) : '';
//     this.ui.modal = 'edit';
//   }
//   // إرسال التعديل
//   submitEdit(): void {
//     if (!this.borrowEdit.id || !this.borrowEdit.memberId || !this.borrowEdit.bookId) {
//       alert('الرجاء اختيار عضو وكتاب');
//       return;
//     }

//     const payload  = {
//       memberId: this.borrowEdit.memberId,
//       bookId: this.borrowEdit.bookId,
//       borrowDate: this.borrowEdit.borrowDate,
//       returnDate: this.borrowEdit.returnDate
//     };

//     this.loading = true;
//     this.borrowService.update(this.borrowEdit.id!, payload).subscribe({
//       next: (updated) => {
//         // حدث السجل المحلي
//         this.borrowings = this.borrowings.map(b =>
//           b.id === updated.id
//             ? {
//                 ...b,
//                 memberId: updated.memberId,
//                 memberName: updated.memberName ?? updated.memberId,
//                 bookId: updated.bookId,
//                 bookTitle: updated.bookTitle ?? updated.bookId,
//                 borrowDate: updated.borrowDate,
//                 returnDate: updated.returnDate ?? null
//               }
//             : b
//         );
//         this.applyFilter();
//         this.loading = false;
//         this.closeModal();
//       },
//       error: (err) => {
//         this.loading = false;
//         this.errorMsg = 'فشل في تعديل الاستعارة';
//         console.error('update borrow error', err);
//       }
//     });
//   }
//   trackById = (_: number, it: { id: string }) => it.id;
// }

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Borrow, BorrowingRead } from '../../models/borrow.model/borrow.model';
import { HomeComponent } from '../home/home.component';
import { BookService } from '../../services/book-service/book-service';
import { BorrowService } from '../../services/borrow-service/borrow-service';
import { finalize, forkJoin } from 'rxjs';
import { MemberService } from '../../services/mamber-service/mamber-service';
import { MemberRead } from '../../models/Mamber.model/member.model';
import { PermissionService } from '../../core/permissions/permission.service';

type ModalType = 'none' | 'borrow' | 'return'| 'edit';


@Component({
  selector: 'app-borrow',
  standalone: true,
  imports: [CommonModule, FormsModule,HomeComponent],
  templateUrl: './borrow.component.html',
  styleUrls: ['./borrow.component.css'],
})
export class BorrowComponent {
  constructor(private bookService: BookService,
              private borrowService: BorrowService,
              private memberService:MemberService ,
              public permissionService:PermissionService) {}
  loading = false;
  errorMsg = '';

  search = '';
  onlyActive = false;

  members :MemberRead[] = [];
  borrowings: BorrowingRead[] = [];  
  borrowing: BorrowingRead[] = [];  
  filtered: BorrowingRead[] = [];

  books: Array<{id: string; title: string}> = []; 

  selectedBorrowingId: string | null = null;
  selectedMemberId: string | null = null;
  selectedBookId: string | null = null;
  borrowDate: string = new Date().toISOString().slice(0,16);
  returnDate: string = new Date().toISOString().slice(0,16);

  borrowEdit: {
    id: string | null;
    memberId: string | null;
    memberName: string;
    bookId: string | null;
    bookTitle: string;
    borrowDate: string;
    returnDate: string;
  } = {
    id: null,
    memberId: null,
    memberName: '',
    bookId: null,
    bookTitle: '',
    borrowDate: '',
    returnDate: ''
  };
  ui = { modal: <ModalType>'none' };

  
  ngOnInit(): void {
    this.loadData();
    this.applyFilter();
  }
  loadData(): void {
    this.loading = true;
    this.errorMsg = '';
    this.borrowService.getAll({ page: 1, pageSize: 100 }).subscribe({
      next: (borrowsPaged) => {
        this.borrowings = borrowsPaged?.items ?? [];
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = 'فشل في تحميل الاستعارات';
        console.error('loadData error', err);
      },
    });
  }
  loadModalData(): void {
    if (this.members.length > 0 && this.books.length > 0) {
        return;
    }
    
    this.loading = true;
    this.errorMsg = '';
    
    forkJoin({
        booksPaged: this.bookService.getBooks({ page: 1, pageSize: 100 }),
        membersList: this.memberService.getMembers()
    })
    .pipe(finalize(() => (this.loading = false)))
    .subscribe({
        next: ({ booksPaged, membersList }) => {
            this.books = booksPaged?.items?.map(b => ({ id: b.id, title: b.title })) ?? [];
            this.members = Array.isArray(membersList) ? membersList : [];
        },
        error: (err) => {
            console.error('Error loading modal data', err);
            this.errorMsg = 'فشل في جلب بيانات الكتب والأعضاء للمودال.';
        }
    });
  }

  loadMembers(): void {
      this.loading = true;
      this.errorMsg = '';
      this.memberService.getMembers()
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: (list) => {
            this.members = Array.isArray(list) ? list : [];
            this.applyFilter();
          },
          error: (err) => {
            console.error('Error loading members', err);
            this.errorMsg = 'فشل في جلب الأعضاء.';
          }
        });
  }
  applyFilter(): void {
    const q = (this.search || '').trim().toLowerCase();
    let data = [...this.borrowings];

    if (q) {
      data = data.filter(b =>
        (b.memberName?.toLowerCase().includes(q)) ||
        (b.bookTitle?.toLowerCase().includes(q))
      );
    }
    if (this.onlyActive) {
      data = data.filter(b => !b.returnDate);
    }
    this.filtered = data;
  }

  openBorrowModal(): void {
    this.loadModalData();
    this.ui.modal = 'borrow';
  }

  openReturnModal(b?: BorrowingRead ): void {
    if (b) this.selectedBorrowingId = b.id;
    this.ui.modal = 'return';
  }

  closeModal(): void {
    this.ui.modal = 'none';
  }

  onBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) this.closeModal();
  }
  submitBorrow(): void {
    if (!this.selectedMemberId || !this.selectedBookId) {
      alert('الرجاء اختيار عضو وكتاب');
      return;
    }

    const formattedBorrowDate = new Date(this.borrowDate).toISOString();
    const formattedReturnDate = this.returnDate 
        ? new Date(this.returnDate).toISOString() 
        : null; 

    const newBorrow: Borrow = {
      memberId: this.selectedMemberId,
      bookId: this.selectedBookId,
      borrowDate: formattedBorrowDate,
      returnDate: formattedReturnDate
    };
    
    this.loading = true; 
    this.errorMsg = ''; 

    this.borrowService.borrowBook(newBorrow)
    .pipe(finalize(() => {
      this.loading = false;
      this.closeModal();
    }))
    .subscribe({
      next: (newRecord) => {
        this.borrowings.push(newRecord);
        this.applyFilter();
      },
      error: (err) => {
          this.loading = false;
          let serverMessage = 'فشل في إضافة الاستعارة (400). الرجاء التحقق من البيانات.';
          console.error('CREATE BORROW error', err);
          if (err.error) {
              console.error('Server Validation Details (JSON):', JSON.stringify(err.error, null, 2));
              const serverError = err.error;
              
              if (serverError.message) {
                  serverMessage = serverError.message;
              } else if (serverError.errors) {
                  const fieldErrors = serverError.errors;
                  let detail = 'حقول غير صالحة: ';
                  for (const key in fieldErrors) {
                      if (fieldErrors.hasOwnProperty(key)) {
                          detail += `[${key}: ${fieldErrors[key].join(' | ')}] `;
                      }
                  }
                  serverMessage = detail;
              } else if (typeof serverError === 'string') {
                  serverMessage = serverError;
              }
          }
          this.errorMsg = serverMessage; 
      }
    });
  }
  confirmReturn(): void {
    if (!this.selectedBorrowingId) return;

    this.loading = true;

    this.borrowService.deleteBorrowing(this.selectedBorrowingId).subscribe({
      next: () => {
        this.borrowings = this.borrowings.filter(b => b.id !== this.selectedBorrowingId);
        this.applyFilter();

        this.selectedBorrowingId = null;
        this.loading = false;
        this.closeModal();
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = 'فشل في حذف الاستعارة من الخادم';
        console.error('DELETE /borrowings/{id} error', err);
      }
    });
  }
  openEditModal(b: BorrowingRead): void {
    this.borrowEdit.id = b.id;
    this.borrowEdit.memberId   = b.memberId ?? null;
    this.borrowEdit.bookId     = b.bookId ?? null;

    this.borrowEdit.memberName = (b.memberName ?? b.memberId ?? '').toString();
    this.borrowEdit.bookTitle  = (b.bookTitle  ?? b.bookId   ?? '').toString();

    this.borrowEdit.borrowDate = this.borrowService.toInput(b.borrowDate || new Date().toISOString());
    this.borrowEdit.returnDate = b.returnDate ? this.borrowService.toInput(b.returnDate) : '';
    this.ui.modal = 'edit';
  }
  submitEdit(): void {
    if (!this.borrowEdit.id || !this.borrowEdit.memberId || !this.borrowEdit.bookId) {
      alert('الرجاء اختيار عضو وكتاب');
      return;
    }

    const payload  = {
      memberId: this.borrowEdit.memberId,
      bookId: this.borrowEdit.bookId,
      borrowDate: this.borrowEdit.borrowDate,
      returnDate: this.borrowEdit.returnDate
    };

    this.loading = true;
    this.borrowService.update(this.borrowEdit.id!, payload).subscribe({
      next: (updated) => {
        this.borrowings = this.borrowings.map(b =>
          b.id === updated.id
            ? {
                ...b,
                memberId: updated.memberId,
                memberName: updated.memberName ?? updated.memberId,
                bookId: updated.bookId,
                bookTitle: updated.bookTitle ?? updated.bookId,
                borrowDate: updated.borrowDate,
                returnDate: updated.returnDate ?? null
              }
            : b
        );
        this.applyFilter();
        this.loading = false;
        this.closeModal();
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = 'فشل في تعديل الاستعارة';
        console.error('update borrow error', err);
      }
    });
  }
  trackById = (_: number, it: { id: string }) => it.id;
}