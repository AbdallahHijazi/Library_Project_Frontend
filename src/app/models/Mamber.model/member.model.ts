export interface Borrowing {
  id: string;
  memberId: string;
  bookId: string;
  bookTitle : string;  // لإظهار اسم الكتاب
  borrowDate: string;        // ISO string من الـ API
  returnDate: string | null; // ممكن تكون null
}

export interface MemberRead {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  registrationDate: string;  // ISO string
  borrowings: Borrowing[];
  borrowingsCount: number;   // إن وجِدت بالـ API، وإلا استخدم borrowings.length
}
export interface CreateMember {
  fullName: string;
  email: string;
  phoneNumber: string;
}