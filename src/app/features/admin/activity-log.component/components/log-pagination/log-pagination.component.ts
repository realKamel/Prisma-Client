import { Component, output, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapChevronLeft, bootstrapChevronRight } from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-log-pagination',
  imports: [DecimalPipe, NgIcon],
  viewProviders: [
    provideIcons({
      bootstrapChevronLeft,
      bootstrapChevronRight,
    }),
  ],
  templateUrl: './log-pagination.component.html',
})
export class LogPaginationComponent {
  readonly currentPage = input(1);
  readonly totalPages = input(1);
  readonly totalItems = input(0);
  readonly pageSize = input(8);
  readonly pageChange = output<number>();

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
