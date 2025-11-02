import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { PermissionService } from '../../core/permissions/permission.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
   currentPageName: string = '';
  isHovered: boolean = false;
  
   private base = `${environment.apiBaseUrl}/User/logout`;

  constructor(private route: ActivatedRoute,
              private http: HttpClient, 
              private router: Router,
              private permissionService: PermissionService) {
    this.route.url.subscribe(url => {
      this.currentPageName = url[0]?.path || 'الصفحة الرئيسية';
    });
  }
  ngOnInit(): void {
    // this.permissionService.loadMyPermissions();
    
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.isHovered = true;
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.isHovered = false;
  }

  logout() {
      const token = localStorage.getItem('authToken'); // هنا الاسم الموحد (المفترض)

      if (!token) {
          // ... (معالجة عدم وجود التوكن)
      }

      this.http.post(`${this.base}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        // 🚨 الحل هنا: أخبر Angular أن الاستجابة نصية
        responseType: 'text' as 'json' // <--- هذا هو الإضافة الحاسمة
      }).subscribe({
        next: (response) => {
          // إذا كان الباك إند يرجع نصًا، فـ response هنا سيكون نصًا
          console.log('Logged out successfully (Angular handled text response).');
          
          // الآن يمكن تنظيف التوكن والـ Service والتوجيه
          localStorage.removeItem('authToken');
          this.permissionService.clearPermissions();
          this.router.navigate(['/welcome']);
        },
        error: (err) => {
          // لن يتم الوصول إلى هنا الآن إذا كان الخطأ بسبب التحليل
          console.error('Logout failed unexpectedly (check backend status code)', err);
          
          // **ملاحظة:** الأفضل أن تنظف هنا أيضاً كإجراء أمان:
          localStorage.removeItem('authToken');
          this.permissionService.clearPermissions();
          this.router.navigate(['/welcome']);
        }
      });
  }
  convertToHome(){
    return this.router.navigate(['/home']);
  }
  convertToBook(){
     return this.router.navigate(['/book']);
  }
  convertToMember(){
    return this.router.navigate(['/member']);
  }
  convertToBorrow(){
    return this.router.navigate(['/borrow']);
  }
  convertToReport(){
    return this.router.navigate(['/report']);
  }
}
