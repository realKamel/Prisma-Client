import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  bootstrapArrowLeft,
  bootstrapCashStack,
  bootstrapPeopleFill,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SectionCardDto } from '../../../../../core/Models/Admin/dashboardmodel';

@Component({
  selector: 'app-section-nav-grid',
  imports: [RouterLink, NgIcon, TranslatePipe],
  templateUrl: './section-nav-grid.html',
  viewProviders: [
    provideIcons({
      bootstrapCashStack,
      bootstrapArrowLeft,
      bootstrapPeopleFill,
    }),
  ],
  providers: [DecimalPipe],
})
export class SectionNavGridComponent {
  public readonly cards = input.required<SectionCardDto[]>();
  private readonly numberPipe = inject(DecimalPipe);
  private readonly translate = inject(TranslateService);
  private readonly countsById = computed(() => {
    return new Map(this.cards().map((c) => [c.id, c.count]));
  });

  protected financesStat(): string {
    return this.translate.instant('ADMIN_DASHBOARD.SECTIONS.PENDING_WITHDRAWALS', {
      count: this.numberPipe.transform(this.countsById().get('finances') ?? 0),
    });
  }

  protected supportStat(): string {
    return this.translate.instant('ADMIN_DASHBOARD.SECTIONS.ACTIVE_ALERTS', {
      count: this.numberPipe.transform(this.countsById().get('support') ?? 0),
    });
  }
}
