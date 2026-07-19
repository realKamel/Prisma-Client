import { Component, computed, inject, input } from '@angular/core';
import { SectionCardDto } from '../../../../../core/Models/Admin/dashboardmodel';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-section-nav-grid',
  imports: [RouterLink],
  templateUrl: './section-nav-grid.html',
})
export class SectionNavGrid {
  readonly cards = input.required<SectionCardDto[]>();
  private readonly numberPipe = inject(DecimalPipe)
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
