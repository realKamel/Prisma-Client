import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SectionCardDto, SectionCardId } from '../../../../../core/Models/Admin/dashboardmodel';
import { toAr } from '../ar-digits.util';

/**
 * Presentation-only config, fully static in the frontend and keyed by the
 * stable `id` the backend sends. Title/subtitle/stat wording/icon/colors/url
 * are never part of the API payload — the backend only sends `count`.
 */
interface SectionStaticConfig {
  title: string;
  subtitle: string;
  /** Builds the stat line from the backend-provided count, e.g. "١ معلم نشط". */
  statLabel: (count: string) => string;
  icon: string;
  url: string;
  blobClass: string;
  iconBgClass: string;
  iconColorClass: string;
  statTextClass: string;
}

const SECTION_STATIC_CONFIG: Record<SectionCardId, SectionStaticConfig> = {
  finances: {
    title: 'المالية والأرباح',
    subtitle: 'الإيرادات الإجمالية، صرف المستحقات، نزاعات الاسترداد',
    statLabel: (count) => `${count} طلب سحب معلّق`,
    icon: 'bi-cash-stack',
    url: '41-admin-finances.html',
    blobClass: 'bg-[var(--star)]',
    iconBgClass: 'bg-[rgba(247,201,72,0.16)]',
    iconColorClass: 'text-[var(--star)]',
    statTextClass: 'text-[var(--star)]',
  },
  support: {
    title: 'الدعم والمشاكل',
    subtitle: 'تقنية الحسابات، سجلات الأخطاء، سجل التدقيق',
    statLabel: (count) => `${count} تحذير نشط`,
    icon: 'bi-life-preserver',
    url: '42-admin-support.html',
    blobClass: 'bg-[var(--coral)]',
    iconBgClass: 'bg-[rgba(240,106,106,0.16)]',
    iconColorClass: 'text-[var(--coral)]',
    statTextClass: 'text-[var(--coral)]',
  },
};

@Component({
  selector: 'app-section-card',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './section-card.html',
})
export class SectionCard {
  readonly card = input.required<SectionCardDto>();

  private readonly config = computed(() => SECTION_STATIC_CONFIG[this.card().id]);

  title(): string {
    return this.config().title;
  }

  subtitle(): string {
    return this.config().subtitle;
  }

  stat(): string {
    return this.config().statLabel(toAr(this.card().count));
  }

  icon(): string {
    return this.config().icon;
  }

  url(): string {
    return this.config().url;
  }

  blobClass(): string {
    return this.config().blobClass;
  }

  iconBgClass(): string {
    return this.config().iconBgClass;
  }

  iconColorClass(): string {
    return this.config().iconColorClass;
  }

  statTextClass(): string {
    return this.config().statTextClass;
  }
}