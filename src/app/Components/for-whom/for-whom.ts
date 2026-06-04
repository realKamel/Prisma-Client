import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-for-who',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './for-whom.html',
  styleUrls: ['./for-whom.css'],
})
export class ForWhom {
  audiences = [
    {
      emoji: '🎒',
      title: 'للطالب',
      subtitle: 'ذاكر بالطريقة اللي تحبها',
      description: 'دروسك في مكان واحد، واضحة ومرتبة. اذاكر بسرعتك واعرف وين وصلت في أي وقت.',
      features: [
        'دروس واضحة وممتعة',
        'فتح الدرس أونلاين أو بكود',
        'كويزات تفاعلية بعد كل درس',
        'تابع درجاتك وتقدمك',
        'سلسلة يومية وتحديات ممتعة 🔥',
      ],
      cta: 'ابدأ مجاناً',
    },
    {
      emoji: '👨‍👧',
      title: 'لولي الأمر',
      subtitle: 'اعرف ابنك بيذاكر ولا لا',
      description: 'تقارير واضحة، حضور ودرجات، كل أسبوع على جوالك — من غير ما تسأل ابنك.',
      features: [
        'تقارير أسبوعية على واتساب',
        'شوف حضور ابنك وإنواع الدروس',
        'درجات الامتحانات والواجبات',
        'وضوح تام فيما دفع وما هو متاح',
        'تواصل مباشر مع المعلم',
      ],
      cta: 'سجّل ابنك الآن',
      accentLine: true,
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