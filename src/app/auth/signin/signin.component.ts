import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatSelectModule } from '@angular/material/select';
import { signinService } from '../../services/signin-sevice/signin-service';

@Component({
  selector: 'app-signin',
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule,RouterModule,
            MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule
      ],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css'
})
export class SigninComponent {
 private fb = inject(FormBuilder);
  private auth = inject(signinService);
  private router = inject(Router);

  loading = false;
  errorMsg = '';
  successMsg = '';

  form: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: passwordsMatch });

  has(ctrl: string, err: string) {
    const c = this.form.get(ctrl);
    return !!(c && c.touched && c.hasError(err));
  }

  onSubmit() {
    this.errorMsg = '';
    this.successMsg = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    const payload = {
      fullName: v.fullName as string,
      email: v.email as string,
      password: v.password as string,
      caniformPassword: v.confirmPassword as string, // 👈 الاسم الذي يطلبه الباك
    };

    this.loading = true;
    this.auth.register(payload).subscribe({
      next: (res) => {
        this.loading = false;
        // خزن التوكن وتاريخ الانتهاء
        localStorage.setItem('access_token', res.token);
        localStorage.setItem('access_expires', res.expiresAt);
        localStorage.setItem('user_name', res.fullName);
        localStorage.setItem('user_role', res.role);

        this.successMsg = 'تم إنشاء الحساب وتسجيل الدخول 🎉';
        // وجّه مثلاً للصفحة الرئيسية
        this.router.navigateByUrl('/home');
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'فشل إنشاء الحساب.';
        console.error('register error', err);
      }
    });
  }
}

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('password')?.value;
  const conf = group.get('confirmPassword')?.value;
  return pass && conf && pass !== conf ? { passwordMismatch: true } : null;
}