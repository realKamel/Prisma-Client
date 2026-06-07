import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './how-it-works.html'
})
export class HowItWorks {
  steps = [
    { num: '١', emoji: '<i class="bi bi-pencil"></i>', title: 'سجّل مجاناً', desc: 'أنشئ حساب ابنك في دقيقتين بدون بطاقة' },
    { num: '٢', emoji: '<i class="bi bi-book"></i>', title: 'اختار الدرس', desc: 'شوف الدروس المتاحة واختار اللي ابنك محتاجه' },
    { num: '٣', emoji: '<i class="bi bi-credit-card"></i>', title: 'افتح المحتوى', desc: 'ادفع أونلاين أو استخدم كود الاشتراك' },
    { num: '٤', emoji: '<i class="bi bi-trophy"></i>', title: 'تابع التقدم', desc: 'تقارير أسبوعية وشوف تحسّن ابنك بنفسك' }
  ];
}