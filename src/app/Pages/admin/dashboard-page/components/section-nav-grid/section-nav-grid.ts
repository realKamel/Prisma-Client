import { Component, computed, inject, input } from '@angular/core';
import { SectionCardDto } from '../../../../../core/Models/Admin/dashboardmodel';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapArrowLeft,
  bootstrapCashStack,
  bootstrapPeopleFill,
} from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-section-nav-grid',
  imports: [RouterLink, NgIcon],
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
export class SectionNavGrid {
  readonly cards = input.required<SectionCardDto[]>();
  private readonly numberPipe = inject(DecimalPipe);
  private readonly countsById = computed(() => {
    return new Map(this.cards().map((c) => [c.id, c.count]));
  });

  financesStat(): string {
    return `${this.numberPipe.transform(this.countsById().get('finances') ?? 0)} طلب سحب معلّق`;
  }

  supportStat(): string {
    return `${this.numberPipe.transform(this.countsById().get('support') ?? 0)} تحذير نشط`;
  }
}
