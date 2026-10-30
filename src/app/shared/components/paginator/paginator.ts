import { DecimalPipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { bootstrapChevronLeft, bootstrapChevronRight } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';

/**
 * Reusable paginator driven by the fields of PaginatedList<T>.
 * Usage: <app-paginator [pageNumber] [pageSize] [totalCount] [totalPages] (pageChange) />
 */
@Component({
  selector: 'app-paginator',
  imports: [NgIcon, DecimalPipe],
  templateUrl: './paginator.html',
  viewProviders: [provideIcons({ bootstrapChevronLeft, bootstrapChevronRight })],
})
export class PaginatorComponent {
  public readonly pageNumber = input.required<number>(); // 1-based
  public readonly pageSize = input.required<number>();
  public readonly totalCount = input.required<number>();
  public readonly totalPages = input.required<number>();
  public readonly pageChange = output<number>();

  protected readonly from = computed(() =>
    this.totalCount() === 0 ? 0 : (this.pageNumber() - 1) * this.pageSize() + 1,
  );
  protected readonly to = computed(() =>
    Math.min(this.pageNumber() * this.pageSize(), this.totalCount()),
  );

  /** Page numbers to show; null renders as an ellipsis. */
  protected readonly pages = computed<(number | null)[]>(() => {
    const total = this.totalPages();
    const current = this.pageNumber();

    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const wanted = [...new Set([1, current - 1, current, current + 1, total])]
      .filter((p) => p >= 1 && p <= total)
      .sort((a, b) => a - b);

    const result: (number | null)[] = [];
    wanted.forEach((p, i) => {
      if (i > 0 && p - wanted[i - 1] > 1) result.push(null);
      result.push(p);
    });
    return result;
  });

  protected readonly pageBtn =
    'flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-full border px-2 text-xs font-bold transition-colors duration-150';
  protected readonly pageBtnActive = 'bg-primary border-primary text-white';
  protected readonly pageBtnIdle =
    'bg-surface border-border text-ink-subtle hover:text-ink';

  protected go(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.pageNumber()) return;
    this.pageChange.emit(page);
  }
}