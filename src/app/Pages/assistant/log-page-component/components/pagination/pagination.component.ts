import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
})
export class PaginationComponent implements OnChanges {
  @Input() total = 0;
  @Input() perPage = 8;
  @Input() currentPage = 1;
  @Output() pageChange = new EventEmitter<number>();

  pages: number[] = [];
  totalPages = 1;
  rangeFrom = 0;
  rangeTo = 0;

  ngOnChanges(): void {
    this.totalPages = Math.max(1, Math.ceil(this.total / this.perPage));
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.rangeFrom = (this.currentPage - 1) * this.perPage + 1;
    this.rangeTo = Math.min(this.currentPage * this.perPage, this.total);
  }

  goTo(page: number): void {
    if (page !== this.currentPage) this.pageChange.emit(page);
  }

  prev(): void {
    if (this.currentPage > 1) this.pageChange.emit(this.currentPage - 1);
  }

  next(): void {
    if (this.currentPage < this.totalPages) this.pageChange.emit(this.currentPage + 1);
  }
}
