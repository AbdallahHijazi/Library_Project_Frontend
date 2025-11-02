import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SigninComponent } from './auth/signin/signin.component';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { HomeComponent } from './pages/home/home.component';
import { BookComponent } from './pages/book/book.component';
import { MemberComponent } from './pages/member/member.component';
import { BorrowComponent } from './pages/borrow/borrow.component';
import { PermissionGuard } from './core/auth/permission.guard';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ReportsComponent } from './pages/reports/reports.component';

export const routes: Routes = [

    { path: '', component: WelcomeComponent, title: 'المكتبة - ترحيب' },
    { path: 'login', component: LoginComponent, title: 'تسجيل الدخول' },
    { path: 'signin', component: SigninComponent, title: 'إنشاء حساب' },
    { path: 'welcome', component: WelcomeComponent },
    { path: 'report', component: ReportsComponent },
    { 
        path: 'dashboard', 
        component: DashboardComponent, 
        // canActivate: [PermissionGuard]
    },
    { 
        path: 'home', 
        component: HomeComponent,
        // canActivate: [PermissionGuard]
    },
    {
        path: 'book',
        component: BookComponent,
        canActivate: [PermissionGuard],
        // data: { permissionsAll: ['Book.get'] } 
    },
    { 
        path: 'member', 
        component: MemberComponent,
        // canActivate: [PermissionGuard] 
    },
    { 
        path: 'borrow', 
        component: BorrowComponent,
        // canActivate: [PermissionGuard] 
    },
    { path: '**', redirectTo: '' }
];