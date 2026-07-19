import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SectionCardDto } from '../../../../../core/Models/Admin/dashboardmodel';
import { toAr } from '../ar-digits.util';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-section-nav-grid',

  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './section-nav-grid.html',
})
export class SectionNavGrid {
  readonly cards = input.required<SectionCardDto[]>();

  private readonly countsById = computed(() => {
    return new Map(this.cards().map((c) => [c.id, c.count]));
  });

  financesStat(): string {
    return `${toAr(this.countsById().get('finances') ?? 0)} طلب سحب معلّق`;
  }

  supportStat(): string {
    return `${toAr(this.countsById().get('support') ?? 0)} تحذير نشط`;
  }
}
