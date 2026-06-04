import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonials.html',
  styleUrls: ['./testimonials.css'],
})
export class Testimonials {
  testimonials = [
    {
      quote: 'ابني كان يكره المذاكرة. دلوقتي بيطالب بالدرس الجديد بنفسه! التقارير الأسبوعية حاجة تانية خالص.',
      name: 'أم أحمد',
      role: 'ولي أمر · الصف الثالث الإعدادي',
      initial: 'أ',
    },
    {
      quote: 'الدروس واضحة جداً والكويزات بتساعدني أعرف فين ضعفي بالظبط. ربحت في الامتحانات! 🎉',
      name: 'محمد الطالب',
      role: 'طالب · الصف الأول الثانوي',
      initial: 'م',
    },
    {
      quote: 'أنا بسافر كتير وكنت مش قادرة أتابع. دلوقتي التقارير بتيجي على واتساب وعارفة كل حاجة!',
      name: 'أم فاطمة',
      role: 'ولي أمر · الصف الثاني الثانوي',
      initial: 'ف',
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