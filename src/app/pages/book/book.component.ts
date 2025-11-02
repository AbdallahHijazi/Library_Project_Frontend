import { Component, inject, OnInit } from '@angular/core';
import { BookService } from '../../services/book-service/book-service';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookCreate, BookRead } from '../../models/book.model/book.model';
import { finalize } from 'rxjs';
import { BorrowService } from '../../services/borrow-service/borrow-service';
import { Router } from '@angular/router';
import { Borrow } from '../../models/borrow.model/borrow.model';
import { MemberService } from '../../services/mamber-service/mamber-service';
import { MemberRead } from '../../models/Mamber.model/member.model';
import { MatDialog } from '@angular/material/dialog';
import { HomeComponent } from '../home/home.component';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';
import { PermissionService } from '../../core/permissions/permission.service';

@Component({
  selector: 'app-book',
  imports: [CommonModule, FormsModule, NgIf, NgFor, DatePipe,HomeComponent,HasPermissionDirective],
  templateUrl: './book.component.html',
  styleUrl: './book.component.css'
})
export class BookComponent implements OnInit {

  total = 0;
  page = 1;
  pageSize = 10;

  loading = false;
  isAddBookOpen: boolean = false;
  onlyAvailable: boolean = false; 
  isModalOpen = false;
  showConfirm = false;
  showEdit = false;
  isDetailsOpen = false;

  books: BookRead[] = [];
  members: MemberRead[] = [];
  allCategories: string[] = [];
  categories: string[] = [];
  selectedBooks: BookRead[] = [];

  errorMsg = '';
  confirmErrorMsg: string = '';
  successMessage = '';
  category: string = '';
  searchQuery: string = '';
  selectedCategory: string = '';
  editingBook: any = null;
  minCopies: number | null = null;
  maxCopies: number | null = null;
  selectedMemberId: string | null = null;
  selectedBookId: string | null = null;
  selectedBook: BookRead | null = null;
  newBook: BookCreate = {
    title: '',
    author: '',
    category: '',
    // استخدام تاريخ اليوم كقيمة افتراضية (بصيغة ISO string)
    year: new Date().toISOString(), 
    copiesCount: 1 
  };
  borrowData: string = new Date().toISOString();
  returnDate: string = new Date().toISOString();
  private router = inject(Router);
  constructor(
              private bookService: BookService,
              private borrowService : BorrowService,
              private memberService : MemberService,
              private dialog: MatDialog,
              public permissionService: PermissionService
            ) {}
  
  ngOnInit(): void {
    this.loadBooks();
    this.loadBook();
    this.loadMembers();
  }
  loadBooks(): void {
    this.loading = true;
    this.errorMsg = '';
    this.bookService.getBooks({
      page: this.page,
      pageSize: this.pageSize,
      category: this.category || null,
      minCopies: this.minCopies,
      maxCopies: this.maxCopies
    })
    .pipe(finalize(() => (this.loading = false)))
    .subscribe({
      next: res => {
        const items = res.items ?? [];
        this.books = items.map(b => ({ ...b, year: this.bookService.normalizeYear(b.year) }));
        this.mergeCategories(items.map(b => b.category));
        this.total = res.totalCount ?? items.length;
        this.loading = false;
      },
      error: _ => this.loading = false
    });
  }
  loadMembers(): void {
    this.memberService.getMembers().subscribe((response) => {
      this.members = response;
    });
  }
  loadBook(): void {
    this.bookService.getBooks({}).subscribe((response) => {
      this.books = response.items ?? [];
    })
  }
  addBook(): void {
    if (!this.newBook.title || !this.newBook.author || !this.newBook.category) {
      this.errorMsg = 'الرجاء ملء جميع الحقول المطلوبة (العنوان، المؤلف، التصنيف).';
      return;
    }

    this.loading = true;
    this.errorMsg = '';
    this.successMessage = '';

    this.bookService.addBook(this.newBook).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = `تم إضافة الكتاب بنجاح: ${response.title}`;
        
        // 🚨 إعادة تعيين النموذج للادخال مرة أخرى أو التوجيه لصفحة الكتالوج
        this.resetForm();
        // this.router.navigate(['/books']); // مثال على التوجيه
      },
      error: (error) => {
        this.loading = false;
        console.error('Add Book Error:', error);
        this.errorMsg = 'حدث خطأ أثناء إضافة الكتاب. يرجى مراجعة البيانات.';
      }
    });
  }
  openAddBookModal(): void {
    this.isAddBookOpen = true; // 🚨 هذا يفتح المودال
    
    // يجب تهيئة النموذج بدون محاولة الإغلاق
    this.newBook = {
        title: '',
        author: '',
        category: '',
        year: new Date().toISOString(),
        copiesCount: 1 
    };
    this.successMessage = '';
    this.errorMsg = '';
  }
  closeAddBookModal(event: MouseEvent | null = null): void {
      // المنطق للسماح بالإغلاق عبر الخلفية المعتمة أو عبر زر الإلغاء
      if (!event || event.target === event.currentTarget) {
          
          // 🚨 إغلاق المودال
          this.isAddBookOpen = false;
          
          // 🚨 إعادة تعيين النموذج (دون محاولة الإغلاق مرة أخرى)
          this.newBook = {
              title: '',
              author: '',
              category: '',
              year: new Date().toISOString(),
              copiesCount: 1 
          };
          this.successMessage = '';
          this.errorMsg = '';
      }
  }
  resetForm(): void {
      // هذه الدالة ستستخدم بعد الإضافة الناجحة فقط
      
      // 1. إعادة تعيين النموذج
      this.newBook = {
          title: '',
          author: '',
          category: '',
          year: new Date().toISOString(),
          copiesCount: 1 
      };
      
      // 2. مسح رسائل الخطأ/النجاح
      // لا نمسح رسالة النجاح هنا، بل نمسحها عند الفتح أو الإغلاق التام
      this.errorMsg = '';
      
      // 3. 🚨 إغلاق المودال بعد الإضافة الناجحة
      this.isAddBookOpen = false; 
      
      // 4. إعادة تحميل البيانات إذا لزم الأمر
      // this.loadBooks(); 
  }
  applyFilters(): void {
    this.page = 1;
    
    // 🚨 إذا كان 'اعرض المتاح فقط' مُعلَّم، تجاوز أي قيمة لـ minCopies وضع 1
    if (this.onlyAvailable) {
        this.minCopies = 1;
    } else if (this.minCopies !== null && this.minCopies < 0) {
        // تأكد من عدم وجود قيم سالبة
        this.minCopies = null;
    }
    
    // يمكنك أيضًا إضافة منطق لـ maxCopies للتأكد من أنها ليست سالبة إذا أردت.
    
    this.loadBooks();
  }

  deleteBook(bookId: string): void {
    this.bookService.deleteBook(bookId).subscribe({
        next: () => {
            this.books = this.books.filter(b => b.id !== bookId);            
            this.errorMsg = ''; 
            this.closeConfirm();
        },
        error: (err) => {
            console.error('فشل في حذف الكتاب:', err);            
            let errorMessage = 'فشل في حذف الكتاب. يرجى مراجعة سجلات الاستعارة.'; 
            if (err.status === 409 && err.error && typeof err.error === 'string') {
                errorMessage = err.error; 
            } else if (err.error && err.error.message) {
                 errorMessage = err.error.message;
            }
            if (errorMessage.includes("active borrowings")) {
                 this.confirmErrorMsg = '⚠️ لا يمكن حذف الكتاب. لديه استعارات غير معادة.';
                 this.errorMsg = '';
            } else {
                 this.errorMsg = '';
                 this.confirmErrorMsg = '';
            }
        }
    });
  }
  openConfirmDialog(id: string) {
    this.selectedBookId = id;
    this.showConfirm = true;

  }
  closeConfirm() {
    this.showConfirm = false;
    this.selectedBookId = null;
    this.confirmErrorMsg = '';
  }
  confirmDelete() {
    if (!this.selectedBookId) return;
    this.deleteBook(this.selectedBookId);
  }
  details(b: BookRead) {
    this.loading = true;
    this.errorMsg = '';
    this.selectedBook = null;

    this.bookService.getBookById(b.id).subscribe({
      next: book => {
        console.log('getBookById result:', book);
        this.selectedBook = book;
        this.loading = false;
      },
      error: err => {
        console.error('getBookById failed', err);
        this.errorMsg = 'تعذّر تحميل تفاصيل الكتاب.';
        this.loading = false;
      }
    });
  }
  openModal(book: BookRead): void {
    this.selectedBookId = book.id; 
    this.isModalOpen = true;  
  }
  closeModal(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.isModalOpen = false; 
    }
  }

  submitBorrow(): void {
    
    if (!this.selectedMemberId || !this.selectedBookId) {
        alert('الرجاء تحديد عضو وكتاب أولاً');
        return; // إنهاء الدالة مبكراً
    }

    // 1. 🚨 التحقق من الحد الأقصى للاستعارة على مستوى العضو
    var member = this.members.find(m => m.id === this.selectedMemberId);

    // تأكد أن العضو موجود ولديه حقل borrowingsCount
    // ويجب أن يكون هذا الحقل (borrowingsCount) محدثاً ويأتي من الباك إند
    if (member && member.borrowingsCount >= 2) {
        alert('لا يمكنك استعارة أكثر من كتابين في نفس الوقت.');
        return; // 🚨 منع الإرسال
    }

    // 2. إرسال طلب الاستعارة (إذا تجاوزنا التحقق)
    const newborrow: Borrow = {
        memberId: this.selectedMemberId,
        bookId: this.selectedBookId,
        borrowDate: this.borrowData,
        returnDate: this.returnDate,
    };

    this.borrowService.borrowBook(newborrow).subscribe({
        next: (response) => {
            console.log('تمت الاستعارة بنجاح', response);
            this.isModalOpen = false; // إغلاق المودال

            // 3. تحديث واجهة المستخدم بعد النجاح
            // يجب تحديث عدد النسخ المتاحة (في قائمة الكتب)
            const bookToUpdate = this.books.find(b => b.id === this.selectedBookId);
            if (bookToUpdate && bookToUpdate.copiesCount > 0) {
                bookToUpdate.copiesCount -= 1;
            }
            
            // 4. 🚨 تحديث عدد استعارات العضو (مهم جداً)
            if (member) {
                member.borrowingsCount += 1;
            }

            // يمكنك هنا استدعاء دالة لتحميل البيانات مرة أخرى أو تحديث الـ UI
            // this.loadBooks();
        },
        error: (err) => {
            console.error('حدث خطأ أثناء الاستعارة', err);
            alert('فشل في عملية الاستعارة');
        },
    });
  }
  openDetails(b: BookRead) {
  this.isDetailsOpen = true;
  this.loading = true;
  this.errorMsg = '';
  this.selectedBook = null;

  this.bookService.getBookById(b.id).subscribe({
    next: book => {
      this.selectedBook = book;
      this.loading = false;
    },
    error: err => {
      console.error('getBookById error', err);
      this.errorMsg = 'تعذّر تحميل تفاصيل الكتاب.';
      this.loading = false;
    }
  });
  }
  closeDetails() {
    this.isDetailsOpen = false;
    this.selectedBook = null;
    this.errorMsg = '';
  }
  onBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) this.closeDetails();
  }
  prev(): void {
    if (this.page > 1) { this.page--; this.loadBooks(); }
  }
  next(): void {
    if (this.page * this.pageSize < this.total) { this.page++; this.loadBooks(); }
  }
  downloadExcel(): void {
    
    // 🚨 1. التأكد من تحديث متغيرات minCopies و maxCopies بناءً على 'onlyAvailable'
    // هذا يضمن أن التصدير يراعي حالة الـ Checkbox "اعرض المتاح فقط"
    const currentMinCopies = this.onlyAvailable ? 1 : this.minCopies;
    const currentMaxCopies = this.maxCopies;

    // 2. تمرير متغيرات الفلترة الحالية إلى خدمة التصدير
    this.bookService.exportToExcel({
      category: this.category || null,
      minCopies: currentMinCopies, // نستخدم القيمة المُحدّثة
      maxCopies: currentMaxCopies
    }).subscribe({
      next: res => {
        const cd = res.headers.get('content-disposition') ?? '';
        const m = /filename="?([^"]+)"?/.exec(cd);
        const filename = m?.[1] ?? `Books_${Date.now()}.xlsx`;

        const blob = res.body!;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: err => {
        console.error('Excel export failed', err);
        alert('فشل تصدير الإكسل');
      }
    });
  }
  borrow(b: BookRead) {
    if (b.copiesCount <= 0) { return; }
    if (!this.selectedMemberId) {
      alert('اختر عضوًا أولاً قبل الاستعارة.');
      return;
    }
    this.borrowService.borrow({ memberId: this.selectedMemberId, bookId: b.id })
      .subscribe({
        next: _ => this.loadBooks(),   // حدّث القائمة بعد النجاح
        error: err => { console.error(err); alert('فشلت عملية الاستعارة'); }
      });
  }
  private mergeCategories(cats: string[]) {
  const s = new Set(this.allCategories);
  for (const c of cats) { if (c) s.add(c); }
  this.allCategories = Array.from(s).sort();
  this.categories = this.allCategories.slice(); // لا نختصرها
  }
  updateBook() {
    if (!this.editingBook) return;

      const payload = {
        title: this.editingBook.title,
        author: this.editingBook.author,
        category: this.editingBook.category,
        year: this.editingBook.year,
        copiesCount: this.editingBook.copiesCount
      };
      this.bookService.updateBook(this.editingBook.id, payload)
        .subscribe({
                      next: (updateBook) => {
                        // تحديث البيانات محلياً
                        this.books = this.books.map(c =>
                          c.id === updateBook.id ? updateBook : c
                        );
                        this.closeEdit();
                        console.log('Updated book from API:', updateBook);
                      },
                      error: () => {
                        this.errorMsg = 'فشل في تعديل الكتاب';
                      }
        });
  }
  openEditDialog(book: any) {
    this.permissionService.keys$.subscribe(k => console.log('PERMS =>', k));

  this.editingBook = { ...book }; 
  this.showEdit = true;
  }
  closeEdit() {
  this.showEdit = false;
  this.editingBook = null;
  }
  getMemberName(memberId: string): string {
    const member = this.members.find(m => m.id === memberId);
    return member ? member.fullName : 'عضو غير معروف';
  }

  trackById = (_: number, b: BookRead) => b.id;
}
