import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CreateMember, MemberRead } from "../../models/Mamber.model/member.model";



@Injectable({ providedIn: 'root' })
export class MemberService {

  private base = `${environment.apiBaseUrl}/Member`;

  constructor(private http: HttpClient) {}

  createMember(id: string): Observable<any> {
    return this.http.post<any>(`${this.base}`, {});
  }
  // قائمة كاملة بدون pagination
  getMembers(): Observable<MemberRead[]> {
    return this.http.get<MemberRead[]>(this.base);
  }
  addMember(create: CreateMember): Observable<MemberRead> {
    return this.http.post<MemberRead>(`${this.base}`, create);
  }
  getMembersFordashbord(page: number = 1, pageSize: number = 1000): Observable<MemberRead[]> {
    return this.http.get<MemberRead[]>(`${this.base}?page=${page}&pageSize=${pageSize}`); 
  }
  // جلب عضو واحد
  getMemberById(id: string): Observable<MemberRead> {
    return this.http.get<MemberRead>(`${this.base}/${id}`);
  }

  deleteMember(memberId: string): Observable<void> {
  return this.http.delete<void>(`${this.base}/${memberId}`);
  }

}