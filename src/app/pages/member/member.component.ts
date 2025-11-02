import { CommonModule, NgIf, NgFor, DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MemberService } from '../../services/mamber-service/mamber-service';
import { finalize, forkJoin } from 'rxjs';
import { Borrow } from '../../models/borrow.model/borrow.model';
import { BorrowService } from '../../services/borrow-service/borrow-service';
import { BookRead } from '../../models/book.model/book.model';
import { Borrowing, MemberRead } from '../../models/Mamber.model/member.model';
import { HttpClientModule } from '@angular/common/http';
import { BookService } from '../../services/book-service/book-service';
import { HomeComponent } from '../home/home.component';
import { PermissionService } from '../../core/permissions/permission.service';

type ModalType = 'none' | 'details' | 'add' | 'borrow' | 'confirm'| 'return';

@Component({
  selector: 'app-member',
  imports: [CommonModule, FormsModule, NgIf, NgFor, DatePipe,HttpClientModule,HomeComponent],
  templateUrl: './member.component.html',
  styleUrl: './member.component.css'
})
export class MemberComponent implements OnInit {
  total = 0;
  page = 1;
  pageSize = 10;
  memberId: string = '';
  bookId: string = '';

  errorMsg = '';
  search = '';
  loading = false;
  showConfirm =false;
  members: MemberRead[] = [];
  filtered: MemberRead[] = [];
  books: BookRead[] = []; 
  memberBorrowings: Borrowing[] = [];

  selectedBorrowingId: string | null = null;
  selectedMember: MemberRead | null = null;
  selectedBook: BookRead | null = null;
  newMemberPayload = {
    fullName: '',
    email: '',
    phoneNumber: ''
  };
  isDetailsOpen= false; 
  selectedMemberId : string | null = null;
  selectedBookId: string | null = null;
  borrowData: string = new Date().toISOString();
  returnDate: string = new Date().toISOString();
  ui = {
    modal: <ModalType>'none'
  };

  selection = {
    memberId: <string | null>null,
    bookId: <string | null>null
  };
  @ViewChild('formRef') formRef!: ElementRef<HTMLFormElement>;

  constructor(
    private memberService: MemberService,
    private borrowService: BorrowService,
    private bookService: BookService,
    public permissionService:PermissionService
    ) {}

  ngOnInit(): void {
    this.loadMembers();
  }
  loadMembers(): void {
  this.loading = true;
  this.errorMsg = '';
  
  forkJoin({
    membersList: this.memberService.getMembers(),
    booksPaged: this.bookService.getBooks({ page: 1, pageSize: 100 }) 
    })
    .pipe(finalize(() => (this.loading = false)))
    .subscribe({
      next: ({ membersList, booksPaged }) => {
        this.members = Array.isArray(membersList) ? membersList : [];
        
        this.books = booksPaged?.items || []; 
        
        this.applyFilter();
      },
      error: (err) => {
        console.error('Error loading initial data', err);
        this.errorMsg = 'فشل في جلب البيانات الأولية.';
      }
    });
  }
  applyFilter(): void {
    const q = (this.search || '').trim().toLowerCase();
    if (!q) { this.filtered = this.members.slice(); return; }
    this.filtered = this.members.filter(m =>
      (m.fullName?.toLowerCase().includes(q)) ||
      (m.email?.toLowerCase().includes(q)) ||
      (m.phoneNumber?.toLowerCase().includes(q))
    );
  }
  
  openConfirm(memberId: string) {
    this.selectedMemberId = memberId;
    this.ui.modal = 'confirm';
  }
  deleteMember(memberId: string): void {
    this.memberService.deleteMember(memberId).subscribe({
        next: () => {
            this.members = this.members.filter(m => m.id !== memberId);
            this.applyFilter(); 
            this.errorMsg = ''; 
        },
        error: (err) => {
            console.error('فشل في حذف العضو:', err);
            
            let errorMessage = 'فشل في حذف العضو. تأكد من عدم وجود استعارات مرتبطة.'; 
            
            if (err.error && typeof err.error === 'string') {
                errorMessage = err.error; 
            } else if (err.error && err.error.message) {
                 errorMessage = err.error.message;
            }
            
            this.errorMsg = errorMessage;
        }
    });
  }
  confirmDelete() {
    if (!this.selectedMemberId) return;
    this.deleteMember(this.selectedMemberId);
    this.applyFilter();
    this.closeModal();
  }

  viewMemberDetails(member: MemberRead): void {
    this.openModal('details', { member });
  }
  startBorrowFromMember(member: MemberRead): void { 
    this.selectedMember = member; 
    this.selectedBook = null; 
    this.selection.memberId = member.id; 
    this.selection.bookId = null; 
    this.ui.modal = 'borrow';
  }
  submit(): void {
    if (!this.formRef) {
        console.error('Form reference is undefined.');
        return;
    }
    const form = this.formRef.nativeElement;
    switch (this.ui.modal) {          
      case 'add': {
        const payload = {
            fullName: this.newMemberPayload.fullName.trim(),
            email: this.newMemberPayload.email.trim(),
            phoneNumber: this.newMemberPayload.phoneNumber.trim()
        };

        if (!payload.fullName || !payload.email) {
            this.errorMsg = 'الاسم والبريد مطلوبان';
            return;
        }
        
        this.loading = true; // 🔥 يفضل وضع اللودينج هنا
        this.memberService.addMember(payload as any).subscribe({
            next: (created) => {
                this.members = [created, ...this.members];
                this.applyFilter();
                this.newMemberPayload = { fullName: '', email: '', phoneNumber: '' }; // 🔥 تفريغ النموذج
                this.loading = false;
                this.closeModal();
            },
            error: () => {
                this.loading = false; // 🔥 إيقاف اللودينج عند الخطأ
                this.errorMsg = 'فشل في إضافة العضو';
            }
        });
        break;
      }
      case 'borrow': {
        const memberIdToSend = this.selection.memberId || this.selectedMemberId;

        if (!memberIdToSend || !this.selection.bookId) {
            alert('الرجاء تحديد عضو وكتاب أولاً');
            return;
        }
        const isoBorrowDate = new Date(this.borrowData).toISOString();
        const isoReturnDate = new Date(this.returnDate).toISOString();

        const newBorrow: Borrow = {
            memberId: memberIdToSend,
            bookId: this.selection.bookId,
            borrowDate: isoBorrowDate, 
            returnDate: isoReturnDate 
        };

        const member = this.members.find(m => m.id === memberIdToSend);
        if (member?.borrowingsCount && member.borrowingsCount >= 2) {
            alert('لا يمكنك استعارة أكثر من كتابين في نفس الوقت.');
            return;
        }

        this.borrowService.borrowBook(newBorrow).subscribe({
            next: () => {              
                if (this.selection.bookId) {
                    const book = this.books.find(b => b.id === this.selection.bookId);
                    if (book && book.copiesCount > 0) {
                        book.copiesCount -= 1;
                    }
                }

                const memberIndex = this.members.findIndex(m => m.id === memberIdToSend);
                if (memberIndex > -1) {
                    this.members[memberIndex].borrowingsCount = (this.members[memberIndex].borrowingsCount || 0) + 1;
                }
                this.applyFilter(); 
                this.closeModal();
            },
            error: (err) => {
                console.error('حدث خطأ أثناء الاستعارة', err);
                alert('فشل في عملية الاستعارة. (400 Bad Request) قد تكون مشكلة في التواريخ أو البيانات.');
            }
        });
        break;
      }
    }
  }
  openModal(type: ModalType, opts?: { member?: MemberRead; memberId?: string; book?: BookRead }) {
    this.errorMsg = '';
    this.ui.modal = type;

    this.selectedMember = null;
    this.selectedBook = null;
    this.selectedMemberId = null; 
    
    if (opts?.member) {
        this.selectedMember = opts.member;
        this.selectedMemberId = opts.member.id;
        this.selection.memberId = opts.member.id; 
        
        // const member = this.members.find(m => m.id === opts.memberId);
        // if (member) {
        //     this.selectedMember = member; 
        // }
    }
    if (opts?.memberId && !this.selectedMember) {
        this.selectedMemberId = opts.memberId;
        this.selection.memberId = opts.memberId;
        
        const member = this.members.find(m => m.id === opts.memberId);
        if (member) {
            this.selectedMember = member; 
        }
    }
    if (opts?.book) { 
        this.selectedBook = opts.book; 
        this.selectedBookId = opts.book.id; 
        this.selection.bookId = opts.book.id; 
    }
  }

  closeModal() {
    this.ui.modal = 'none';
    this.selectedBook = null;
  }

  onBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) this.closeModal();
  }

  openReturnModal(member: MemberRead) {
    this.selectedMember = member;
    this.selectedMemberId = member.id;
    this.selectedBorrowingId = null;
    this.memberBorrowings = [];

    this.ui.modal = 'return';

      this.borrowService.getBorrowingsByMember(member.id).subscribe({
        next: list => {
          this.memberBorrowings = list.map(b => {
              const book = this.books.find(book => book.id === b.bookId);
              
              return {
                  ...b, 
                  bookTitle: book?.title || 'عنوان غير معروف' 
              };
          });
        },
        error: err => {
          console.error('فشل في جلب استعارات العضو', err);
          this.errorMsg = 'فشل في جلب استعارات العضو';
        }
      });
  }

  confirmReturn() {
    if (!this.selectedBorrowingId) {
      alert('الرجاء اختيار استعارة لإرجاعها.');
      return;
    }
    this.borrowService.deleteBorrowing(this.selectedBorrowingId).subscribe({
      next: (ok) => {
        this.memberBorrowings = this.memberBorrowings.filter(b => b.id !== this.selectedBorrowingId);
        
        if (this.selectedMember) {
          const idx = this.members.findIndex(m => m.id === this.selectedMember!.id);
          if (idx > -1 && (this.members[idx].borrowingsCount ?? 0) > 0) {
            this.members[idx].borrowingsCount!--;
          }
        }
        
        this.applyFilter?.();
        this.closeModal();
      },
      error: err => {
        console.error('فشل في إعادة الكتاب', err);
        this.errorMsg = 'فشل في إعادة الكتاب';
      }
    });
  }

  openAddMemberModal() {
    this.errorMsg = '';
    this.ui.modal = 'add';
    setTimeout(() => this.formRef?.nativeElement?.reset(), 0); 
  }
  trackById = (_: number, m: MemberRead) => m.id;
}