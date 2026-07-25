import { Component, OnChanges, output, input } from '@angular/core';
import { bootstrapChevronLeft, bootstrapChevronRight } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';

@Component({
  selector: 'app-pagination',
  imports: [NgIcon],
  templateUrl: './pagination.component.html',
  viewProviders: [
    provideIcons({
      bootstrapChevronLeft,
      bootstrapChevronRight,
    }),
  ],
})
export class PaginationComponent implements OnChanges {
  readonly total = input(0);
  readonly perPage = input(8);
  readonly currentPage = input(1);
  readonly pageChange = output<number>();

  pages: number[] = [];
  totalPages = 1;
  rangeFrom = 0;
  rangeTo = 0;

  ngOnChanges(): void {
    this.totalPages = Math.max(1, Math.ceil(this.total() / this.perPage()));
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.rangeFrom = (this.currentPage() - 1) * this.perPage() + 1;
    this.rangeTo = Math.min(this.currentPage() * this.perPage(), this.total());
  }

  goTo(page: number): void {
    if (page !== this.currentPage()) this.pageChange.emit(page);
  }

  prev(): void {
    if (this.currentPage() > 1) this.pageChange.emit(this.currentPage() - 1);
  }

  next(): void {
    if (this.currentPage() < this.totalPages) this.pageChange.emit(this.currentPage() + 1);
  }
}
