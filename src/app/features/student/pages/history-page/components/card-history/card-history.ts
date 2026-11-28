import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapArrowRepeat, bootstrapCheckLg, bootstrapPencil, bootstrapPlayFill } from '@ng-icons/bootstrap-icons';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { map } from 'rxjs';
import { History } from '../../../../models/history.models';
import { ImagePlaceholderDirective } from '../../../../../../shared/directives/Image-placeholder/image-placeholder.directive';

const OUTLINE_CTA = 'border border-border text-primary-light hover:bg-primary/10';

const STATUS_UI = {
  Active: {
    label: 'STUDENT.HISTORY.STATUS.ACTIVE',
    chip: 'border-primary/30 text-primary-light',
    dot: 'bg-primary-light animate-pulse',
    route: 'watch',
    ctaLabel: 'STUDENT.HISTORY.CARD.CONTINUE',
    ctaIcon: 'bootstrapPlayFill',
    cta: 'bg-primary text-white shadow-lg shadow-primary/30',
  },
  Done: {
    label: 'STUDENT.HISTORY.STATUS.DONE',
    chip: 'border-mint/30 text-mint',
    dot: 'bg-mint',
    route: 'watch',
    ctaLabel: 'STUDENT.HISTORY.CARD.REVIEW',
    ctaIcon: 'bootstrapCheckLg',
    cta: OUTLINE_CTA,
  },
  Expired: {
    label: 'STUDENT.HISTORY.STATUS.EXPIRED',
    chip: 'border-coral/30 text-coral',
    dot: 'bg-coral',
    route: 'details',
    ctaLabel: 'STUDENT.HISTORY.CARD.RENEW',
    ctaIcon: 'bootstrapArrowRepeat',
    cta: OUTLINE_CTA,
  },
} as const;

@Component({
  selector: 'app-history-card',
  imports: [RouterLink, DatePipe, NgmMotionDirective, ImagePlaceholderDirective, NgIcon, TranslatePipe],
  viewProviders: [
    provideIcons({ bootstrapArrowRepeat, bootstrapCheckLg, bootstrapPencil, bootstrapPlayFill }),
  ],
  templateUrl: './card-history.html',
})
export class HistoryCardComponent {
  private readonly translate = inject(TranslateService);
  readonly infinite = Infinity;
  public readonly lesson = input.required<History>();
  public readonly animationDelay = input(0);
  /** Set only on the first card, so the tour has one anchor. */
  public readonly tourAnchor = input<string | null>(null);

  protected readonly imageError = signal(false);

  protected readonly lang = toSignal(this.translate.onLangChange.pipe(map((e) => e.lang)), {
    initialValue: this.translate.getCurrentLang() ?? 'ar',
  });

  protected readonly ui = computed(() => STATUS_UI[this.lesson().status as keyof typeof STATUS_UI] ?? STATUS_UI.Expired);

  protected readonly dateInfo = computed(() => {
    const l = this.lesson();
    switch (l.status) {
      case 'Done':
        return { key: 'STUDENT.HISTORY.CARD.COMPLETED_ON', date: l.finishAt };
      case 'Active':
        return { key: 'STUDENT.HISTORY.CARD.PURCHASED_ON', date: l.purchaseDate };
      default:
        return { key: 'STUDENT.HISTORY.CARD.EXPIRED_ON', date: l.expiresAt };
    }
  });
}