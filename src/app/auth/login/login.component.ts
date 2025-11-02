import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PermissionService } from '../../core/permissions/permission.service';
import { filter, take } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule,MatFormFieldModule,MatInputModule,MatButtonModule,MatCardModule,
            RouterLink,CommonModule,FormsModule,CommonModule,RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  email: string = '';
  password: string = '';
  constructor(private http: HttpClient,
              private router : Router,
              private fb: FormBuilder,
              private permissionService: PermissionService) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],  // التحقق من البريد الإلكتروني
      password: ['', Validators.required],  // التحقق من كلمة المرور
    });
  }
  
  ngOnInit(): void {
    
  }
  onLogin() {
    if (this.form.invalid) {
      return;
    }
    const body = {
      email: this.form.value.email, 
      password: this.form.value.password
    };
    this.http.post('http://localhost:5184/api/User/login', body).subscribe({
      next: (res: any) => {

        const token = res?.token; 
        if (token) {
          console.log('تم تسجيل الدخول بنجاح');
          localStorage.setItem('userEmail', this.form.value.email);
          localStorage.setItem('authToken', token); 
          this.permissionService.loadPermissionsFromToken();
          this.permissionService.loaded$.pipe(
                                                  filter(loaded => loaded),
                                                  take(1)
                                              ).subscribe(() => {
                                                 this.router.navigate(['/report']);
                                              });
          console.log(token);
          console.log(this.permissionService.loadPermissionsFromToken());

        } else {
          alert('فشل في الحصول على الـ Token');
        }
      },
      error: (err) => {
        console.error('خطأ:', err);
        alert('فشل تسجيل الدخول');
      }
    });
    console.log('Form Submitted', this.form.value);
  }

}

