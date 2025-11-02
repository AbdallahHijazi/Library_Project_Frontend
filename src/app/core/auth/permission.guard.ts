import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanMatch, UrlSegment, Route } from '@angular/router';
import { PermissionService } from '../permissions/permission.service';
import { map, filter, take } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

type RouteData = { permissionsAny?: string[]; permissionsAll?: string[]; };

@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate, CanMatch {
  // constructor(private perms: PermissionService, private router: Router) {}

  // private check(data?: RouteData) {
  //   const needAny = data?.permissionsAny ?? [];
  //   const needAll = data?.permissionsAll ?? [];

  //   return this.perms.loaded$.pipe(
  //     filter(loaded => loaded), // استنى التحميل
  //     take(1),
  //     map(() => {
  //       const okAny = needAny.length ? this.perms.hasAny(needAny) : true;
  //       const okAll = needAll.length ? this.perms.hasAll(needAll) : true;
  //       const ok = okAny && okAll;
  //       if (!ok) this.router.navigateByUrl('/forbidden');
  //       return ok;
  //     })
  //   );
  // }

  //   canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
  //   const requiredPermissions = route.data['permissionsAll'];
  //   return this.perms.loaded$.pipe(
  //       filter(loaded => loaded), // تأكد من أن الصلاحيات تم تحميلها
  //       take(1),
  //       map(() => {
  //       if (this.perms.hasAll(requiredPermissions)) {
  //           return true;
  //       } else {
  //           this.router.navigate(['/forbidden']); // في حال عدم وجود الصلاحية
  //           return false;
  //       }
  //       })
  //   );
  //   }


  // canMatch(route: Route, _segments: UrlSegment[]) {
  //   return this.check(route.data as RouteData);
  // }
  constructor(private perms: PermissionService, private router: Router) {}

  private checkAuthAndPermissions(data?: RouteData): Observable<boolean> {
    
    const token = localStorage.getItem('authToken');
    if (!token) {
        this.router.navigate(['/login']); // 🚨 إعادة التوجيه إلى تسجيل الدخول
        return of(false); // إيقاف الوصول
    }
    
    // 2. التحقق من الصلاحيات (Authorization):
    const needAny = data?.permissionsAny ?? [];
    const needAll = data?.permissionsAll ?? [];

    return this.perms.loaded$.pipe(
      filter(loaded => loaded), // انتظار تحميل الصلاحيات من الخدمة (من التوكن)
      take(1),
      map(() => {
        // إذا لم يتم طلب أي صلاحيات، نعتبر أن التحقق نجح
        if (needAny.length === 0 && needAll.length === 0) {
            return true; 
        }

        const okAny = needAny.length ? this.perms.hasAny(needAny) : true;
        const okAll = needAll.length ? this.perms.hasAll(needAll) : true;
        
        const ok = okAny && okAll;
        
        if (!ok) {
            // توجيه المستخدم إلى صفحة عدم وجود صلاحيات (Forbidden)
            this.router.navigateByUrl('/forbidden');
        }
        return ok;
      })
    );
  }
    
  // 🚨 دمج منطق canActivate مع الدالة checkAuthAndPermissions
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    // نقوم بتمرير بيانات الـ Route إلى دالة التحقق
    const routeData: RouteData = { permissionsAll: route.data['permissionsAll'], permissionsAny: route.data['permissionsAny'] };
    
    // إذا لم تُحدد صلاحيات صريحة (مثل مسار الداشبورد)، نمرر كائناً فارغاً
    return this.checkAuthAndPermissions(routeData); 
  }

  canMatch(route: Route, _segments: UrlSegment[]) {
    return this.checkAuthAndPermissions(route.data as RouteData);
  }
}
