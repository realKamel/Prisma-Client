import { Component, Input, output, input } from '@angular/core';
import { ArabicNumeralsPipe } from '../pipes/arabic-numerals.pipe';

@Component({
  selector: 'app-log-pagination',
  imports: [ArabicNumeralsPipe],
  templateUrl: './log-pagination.component.html',
})
export class LogPaginationComponent {
  protected readonly currentPage = input(1);
  protected readonly totalPages = input(1);
  protected readonly totalItems = input(0);
  protected readonly pageSize = input(8);
  protected readonly pageChange = output<number>();

  get rangeStart(): number {
    return this.totalItems() === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.currentPage() * this.pageSize(), this.totalItems());
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  goTo(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    this.pageChange.emit(page);
  }
}
