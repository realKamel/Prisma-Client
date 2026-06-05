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
    { num: '١', emoji: '🖊️', title: 'سجّل مجاناً', desc: 'أنشئ حساب ابنك في دقيقتين بدون بطاقة' },
    { num: '٢', emoji: '📚', title: 'اختار الدرس', desc: 'شوف الدروس المتاحة واختار اللي ابنك محتاجه' },
    { num: '٣', emoji: '💳', title: 'افتح المحتوى', desc: 'ادفع أونلاين أو استخدم كود الاشتراك' },
    { num: '٤', emoji: '🏆', title: 'تابع التقدم', desc: 'تقارير أسبوعية وشوف تحسّن ابنك بنفسك' }
  ];
}