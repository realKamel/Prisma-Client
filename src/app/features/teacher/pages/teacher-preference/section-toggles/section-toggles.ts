import { Component, OnInit, signal } from '@angular/core';

interface SectionItem {
  key: string;
  nameAr: string;
  descAr: string;
  alwaysOn?: boolean;
  enabled: boolean;
}

@Component({
  selector: 'app-section-toggles',
  imports: [],
  templateUrl: './section-toggles.html',
})
export class SectionTogglesComponent implements OnInit {
  readonly SECTIONS_KEY = 'foundry-sections';

  protected readonly sections = signal<SectionItem[]>([
    {
      key: 'hero',
      nameAr: 'الهيرو',
      descAr: 'القسم الرئيسي مع عنوان المنصة',
      alwaysOn: true,
      enabled: true,
    },
    {
      key: 'features',
      nameAr: 'مميزات المنصة',
      descAr: 'شبكة المميزات والخدمات المقدَّمة',
      enabled: true,
    },
    { key: 'how', nameAr: 'كيف يعمل', descAr: 'خطوات رحلة التعلم على المنصة', enabled: true },
    {
      key: 'for',
      nameAr: 'المواد الدراسية',
      descAr: 'قائمة المواد والصفوف المتاحة',
      enabled: true,
    },
    {
      key: 'testi',
      nameAr: 'آراء الطلاب',
      descAr: 'تقييمات وتجارب الطلاب السابقين',
      enabled: true,
    },
    {
      key: 'cta',
      nameAr: 'الدعوة للتسجيل',
      descAr: 'قسم تشجيع الطلاب الجدد على التسجيل',
      enabled: true,
    },
  ]);

  protected readonly saving = signal(false);
  protected readonly saved = signal(false);

  ngOnInit() {
    const stored = JSON.parse(localStorage.getItem(this.SECTIONS_KEY) || '{}');
    this.sections().forEach((s) => {
      if (!s.alwaysOn && stored[s.key] !== undefined) {
        s.enabled = stored[s.key];
      }
    });
  }

  toggle(s: SectionItem) {
    if (s.alwaysOn) return;
    s.enabled = !s.enabled;
    this.saved.set(false);
  }

  save() {
    this.saving.set(true);
    const state: Record<string, boolean> = {};
    this.sections()
      .filter((s) => !s.alwaysOn)
      .forEach((s) => (state[s.key] = s.enabled));
    setTimeout(() => {
      localStorage.setItem(this.SECTIONS_KEY, JSON.stringify(state));
      this.saving.set(false);
      this.saved.set(true);
      setTimeout(() => this.saved.set(false), 2400);
    }, 1000);
  }
}
