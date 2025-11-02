export interface BorrowingRead {
  id: string;
  memberId: string;
  bookId: string;
  borrowDate: string;           // ISO
  returnDate: string | null;    // ISO أو null
}

export interface BookRead {
  id: string;
  title: string;
  author: string;
  category: string;
  year: number | string | Date; // الباك ممكن يرجّع int أو DateTime
  copiesCount: number;
  borrowingReads: BorrowingRead[];
}
export interface BookCreate {
    title: string;
    author: string;
    category: string;
    year: number | string | Date; // أو Date إذا كنت تستخدم Date Object
    copiesCount: number;
}
export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
