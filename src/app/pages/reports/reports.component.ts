import { Component, computed, ElementRef, signal, ViewChild,ChangeDetectionStrategy } from '@angular/core';
import { DashboardStats, BorrowingReport, ReportsService } from '../../services/reports-service/reports-service';
import { CommonModule } from '@angular/common';
import { HomeComponent } from '../home/home.component';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-reports',
  imports: [CommonModule,HomeComponent],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsComponent {
@ViewChild('pdfContent', { static: false }) pdfContent: ElementRef | undefined;
stats: DashboardStats = {
    totalBooks: 0,
    totalMembers: 0,
    activeMembers: 0,
    borrowedBooks: 0,
    overdueBooks: 0
  };
  mostBorrowedBooks: BorrowingReport[] = [];
  mostActiveMembers: BorrowingReport[] = [];
  overdueBooks: any[] = []; 

  downloading = false;
  loadingStats: boolean = true;
  loadingReports: boolean = true;
  errorMessage: string = '';
  
  // now = signal(new Date());
  // memoryUsage = signal(65);

  // statss = signal([
  //   { title: 'المستخدمون النشطون', value: '450', color: 'indigo', iconPath: 'M13 7l-5.463 9.776A2.977 2.977 0 014 16.5' },
  //   { title: 'حركة المرور اليومية', value: '15.2K', color: 'green', iconPath: 'M3 10h18M7 15h10M4 5h16a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z' },
  //   { title: 'معدل الأخطاء', value: '0.12%', color: 'red', iconPath: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  //   { title: 'طلبات API', value: '8.5M', color: 'yellow', iconPath: 'M9 19V6a3 3 0 00-3-3H3m18 17v-8a2 2 0 00-2-2h-3' },
  // ]);
  //   pieChartData = signal<ChartDataItem[]>([
  //   { label: 'بلايستيشن 3', value: 25, color: '#007bff' }, // أزرق
  //   { label: 'ويي', value: 15, color: '#dc3545' },        // أحمر
  //   { label: 'إكس بوكس 360', value: 20, color: '#28a745' },   // أخضر
  //   { label: 'نينتندو دي إس', value: 10, color: '#17a2b8' }, // تركواز
  //   { label: 'بي إس بي', value: 8, color: '#6610f2' },       // بنفسجي
  //   { label: 'نينتندو 3دي إس', value: 12, color: '#fd7e14' }, // برتقالي
  //   { label: 'بي إس فيتا', value: 10, color: '#20c997' }    // زمردي
  // ]);
  //   // 2. بيانات المخطط العمودي (Column Chart) - قيم كبيرة
  // columnChartData = signal<ChartDataItem[]>([
  //   { label: 'الهند', value: 300000, color: 'indigo' },
  //   { label: 'السعودية', value: 260000, color: 'indigo' },
  //   { label: 'كندا', value: 170000, color: 'indigo' },
  //   { label: 'إيران', value: 150000, color: 'indigo' },
  //   { label: 'روسيا', value: 110000, color: 'indigo' },
  //   { label: 'الإمارات', value: 95000, color: 'indigo' },
  //   { label: 'أمريكا', value: 20000, color: 'indigo' },
  //   { label: 'الصين', value: 15000, color: 'indigo' },
  // ]);
  // maxColumnValue = computed(() => {
  //   return this.columnChartData().reduce((max, current) => Math.max(max, current.value), 0);
  // });

  // حالة لتتبع زاوية البدء في الرسم الدائري
  private currentAngle = 0;
  constructor(private reportsService: ReportsService)
   { 
    // setInterval(() => this.now.set(new Date()), 60000);
   }

  ngOnInit(): void {
    this.loadDashboardStats();
    this.loadAllReports();
  }

  loadDashboardStats(): void {
    this.loadingStats = true;
    this.reportsService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loadingStats = false;
      },
      error: (err) => {
        this.errorMessage = 'فشل في جلب إحصائيات لوحة التحكم.';
        this.loadingStats = false;
        console.error(err);
      }
    });
  }

  loadAllReports(): void {
    this.loadingReports = true;

    this.reportsService.getMostBorrowedBooks(5).subscribe(data => {
      this.mostBorrowedBooks = data;
    });

    this.reportsService.getMostActiveMembers(5).subscribe(data => {
      this.mostActiveMembers = data;
    });

    this.reportsService.getOverdueBooks().subscribe(data => {
      this.overdueBooks = data;
      this.loadingReports = false;
    }, error => {
        this.errorMessage = 'فشل في جلب التقارير التفصيلية.';
        this.loadingReports = false;
    });
  }

  exportServerPdf(): void {
    this.downloading = true;

    this.reportsService.downloadOverduePdf().subscribe({
      next: (res) => {
        const blob = res.body!;
        const dispo = res.headers.get('Content-Disposition') || '';
        const match = /filename\*?=([^;]+)|filename="?([^"]+)"?/.exec(dispo);
        const suggested =
          decodeURIComponent((match?.[1] || match?.[2] || 'تقرير_المكتبة.pdf').trim());

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = suggested;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        this.downloading = false;
      },
      error: (err) => {
        console.error('فشل تنزيل PDF من الخادم:', err);
        this.downloading = false;
        alert('تعذّر تنزيل ملف PDF. تحقّق من الخادم أو CORS.');
      }
    });
  }
//   getSlicePath(percentage: number): string {
//     const radius = 50;
//     const angle = (percentage / 100) * 360;
//     const startAngle = this.currentAngle;
//     const endAngle = startAngle + angle;
    
//     // تحويل الزوايا من درجات إلى راديان
//     const x1 = radius + radius * Math.sin(Math.PI * startAngle / 180);
//     const y1 = radius - radius * Math.cos(Math.PI * startAngle / 180);

//     const x2 = radius + radius * Math.sin(Math.PI * endAngle / 180);
//     const y2 = radius - radius * Math.cos(Math.PI * endAngle / 180);

//     // تحديد إذا كانت الشريحة أكبر من نصف دائرة
//     const largeArcFlag = angle > 180 ? 1 : 0;

//     // بناء مسار SVG
//     const path = `M${radius},${radius} L${x1},${y1} A${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2} Z`;

//     // تحديث زاوية البدء للشريحة التالية
//     this.currentAngle = endAngle;

//     return path;
//   }
// }
// interface ChartDataItem {
// label: string;
// value: number;
// color: string;
}