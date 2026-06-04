import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './how-it-works.html',
  styleUrls: ['./how-it-works.css'],
})
export class HowItWorks {
  steps = [
    {
      number: 1,
      emoji: '✏️',
      title: 'سجّل مجاناً',
      description: 'أنشئ حساب ابنك في دقيقتين بدون بطاقة',
    },
    {
      number: 2,
      emoji: '📚',
      title: 'اختار الدرس',
      description: 'شوف الدروس المتاحة واختار اللي ابنك محتاجه',
    },
    {
      number: 3,
      emoji: '💳',
      title: 'افتح المحتوى',
      description: 'ادفع أونلاين أو استخدم كود الاشتراك',
    },
    {
      number: 4,
      emoji: '🏆',
      title: 'تابع التقدم',
      description: 'تقارير أسبوعية وشوف ابنك يتقدم بنفسك',
    },
  ];

  ngAfterViewInit() {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => e.target.classList.toggle('in', e.isIntersecting)),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }
}