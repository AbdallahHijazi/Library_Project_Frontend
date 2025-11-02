import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { jwtDecode } from 'jwt-decode';  // تم التعديل هنا

type PermObj = { id?: string; key?: string; name?: string; [k: string]: any };

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly apiUrl = `${environment.apiBaseUrl}/Permission`;

  private _loaded$ = new BehaviorSubject<boolean>(false);
  private _keys$ = new BehaviorSubject<string[]>([]);
  private _permissionsFromToken: string[] = [];

  loaded$ = this._loaded$.asObservable();
  keys$ = this._keys$.asObservable();

  constructor(private http: HttpClient) {
    this.loadPermissionsFromToken(); // تحميل الصلاحيات من التوكن عند بداية الخدمة
  }

  private normalize(k: string) {
    return k.trim().toLowerCase();
  }
  async loadMyPermissions(): Promise<void> {
      const token = localStorage.getItem('authToken');
      if (!token) {
          this._keys$.next([]);  // إذا لم يكن هناك توكن، مسح الصلاحيات
          return;
      }
      try {
          const res = await firstValueFrom(this.http.get<any[]>(this.apiUrl));

          let keys: string[] = [];

          if (Array.isArray(res)) {
          keys = res
              .map((x: any) => {
              if (typeof x === 'string') return x;
              const obj = x as { key: string; userPermissions: any[] };
              return obj?.userPermissions?.length ? obj.key : '';
              })
              .filter(Boolean);
          }

          const normalized = Array.from(new Set(keys.map(k => this.normalize(k))));
          this._keys$.next(normalized);
      } catch (error) {
          this._keys$.next([]);
      } finally {
          this._loaded$.next(true);
      }
  }

  has(key: string): boolean {
    return this._permissionsFromToken.includes(this.normalize(key));
  }

  // فحص إذا كان لدى المستخدم أي صلاحية من مجموعة صلاحيات
  hasAny(keys: string[]): boolean {
    return keys.some(key => this._permissionsFromToken.includes(this.normalize(key)));
  }

  // فحص إذا كان لدى المستخدم جميع الصلاحيات
  hasAll(keys: string[]): boolean {
    return keys.every(key => this._permissionsFromToken.includes(this.normalize(key)));
  }

  loadPermissionsFromToken(): void {
      const token = localStorage.getItem('authToken');
      if (!token) {
        this._permissionsFromToken = [];
        this._keys$.next([]);
        return;
      }
        

      try {
          const decodedToken: any = jwtDecode(token);
          const perms = decodedToken?.permissions; // نحصل على القيمة الخام (قد تكون String أو Array)

          let permissionArray: string[] = [];

          if (Array.isArray(perms)) {
              permissionArray = perms;
          } else if (typeof perms === 'string' && perms.length > 0) {
              permissionArray = perms.split(',');
          }

          this._permissionsFromToken = Array.from(new Set(permissionArray.map(k => this.normalize(k))));

          console.log("SUCCESSFULLY LOADED PERMS:", this._permissionsFromToken);
          this._keys$.next(this._permissionsFromToken); // <--- أضف هذا السطر
          this._loaded$.next(true); 
      } catch (err) {
          console.error('Failed to decode token', err);
          this._permissionsFromToken = [];
          this._keys$.next([]); 
      }
  }
  clearPermissions() {
      this._permissionsFromToken = [];
      this._keys$.next([]);
      this._loaded$.next(false);
  }
}
