import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-for-whom',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './for-whom.html'
})
export class ForWhom {
  audiences = [
    {
      emoji: '👨‍👩‍👧',
      title: 'لولي الأمر',
      subtitle: 'اعرف ابنك بيذاكر ولا لا',
      desc: 'تقارير واضحة، حضور ودرجات، كل أسبوع على جوالك — من غير ما تسأل ابنك.',
      cta: 'سجّل ابنك الآن',
      features: [
        'تقارير أسبوعية على واتساب',
        'شوف حضور ابنك وإنهاء الدروس',
        'درجات الامتحانات والواجبات',
        'وضوح تام فيما دُفع وما هو متاح',
        'تواصل مباشر مع المعلم'
      ]
    },
    {
      emoji: '🎒',
      title: 'للطالب',
      subtitle: 'ذاكر بالطريقة اللي تحبها',
      desc: 'دروسك في مكان واحد، واضحة ومرتبة. اذاكر بسرعتك واعرف وين وصلت في أي وقت.',
      cta: 'ابدأ مجاناً',
      features: [
        'دروس واضحة وممتعة',
        'فتح الدرس أونلاين أو بكود',
        'كويزات تفاعلية بعد كل درس',
        'تابع درجاتك وتقدمك',
        'سلسلة يومية وتحدّيات ممتعة 🔥'
      ]
    }
  ];
}