export interface Borrow {
  memberId: string;
  bookId: string;
  borrowDate: string;
  returnDate: string| null;
}

export interface BorrowView {
  id: string;
  memberName: string;
  bookTitle: string;
  borrowDate: string;  // ISO أو Date لاحقًا
  returnDate: string | null;
}


export interface BookRead {
  id: string;
  title: string;
  author?: string;
  category?: string;
  copiesCount: number;
}
export interface BorrowingRead {
  id: string;
  memberId: string;
  memberName?: string;
  bookId: string;
  bookTitle?: string;
  borrowDate: string;       // ISO
  returnDate: string | null;
}