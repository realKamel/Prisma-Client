import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  bootstrapBackpack3,
  bootstrapFire,
  bootstrapMortarboard,
  bootstrapPeople,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';

@Component({
  selector: 'app-for-whom',
  imports: [RouterLink, NgIcon],
  templateUrl: './for-whom.html',
  viewProviders: [
    provideIcons({
      bootstrapMortarboard,
      bootstrapPeople,
      bootstrapBackpack3,
      bootstrapFire,
    }),
  ],
})
export class ForWhom {
  audiences = [
    {
      emoji: '<ng-icon name="bootstrapPeople"></ng-icon>',
      title: 'لولي الأمر',
      subtitle: 'اعرف ابنك بيذاكر ولا لا',
      desc: 'تقارير واضحة، حضور ودرجات، كل أسبوع على جوالك — من غير ما تسأل ابنك.',
      cta: 'سجّل ابنك الآن',
      features: [
        'تقارير أسبوعية على واتساب',
        'شوف حضور ابنك وإنهاء الدروس',
        'درجات الامتحانات والواجبات',
        'وضوح تام فيما دُفع وما هو متاح',
        'تواصل مباشر مع المعلم',
      ],
    },
    {
      emoji: '<ng-icon name="bootstrapBackpack3"></ng-icon>',
      title: 'للطالب',
      subtitle: 'ذاكر بالطريقة اللي تحبها',
      desc: 'دروسك في مكان واحد، واضحة ومرتبة. اذاكر بسرعتك واعرف وين وصلت في أي وقت.',
      cta: 'ابدأ مجاناً',
      features: [
        'دروس واضحة وممتعة',
        'فتح الدرس أونلاين أو بكود',
        'كويزات تفاعلية بعد كل درس',
        'تابع درجاتك وتقدمك',
        'سلسلة يومية وتحدّيات ممتعة <ng-icon name="bootstrapFire"></ng-icon>',
      ],
    },
  ];
}
