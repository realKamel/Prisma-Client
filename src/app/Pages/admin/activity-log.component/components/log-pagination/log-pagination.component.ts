import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ArabicNumeralsPipe } from '../pipes/arabic-numerals.pipe';

@Component({
  selector: 'app-log-pagination',
  standalone: true,
  imports: [ArabicNumeralsPipe],
  templateUrl: './log-pagination.component.html',
})
export class LogPaginationComponent {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() totalItems = 0;
  @Input() pageSize = 8;
  @Output() pageChange = new EventEmitter<number>();

  get rangeStart(): number {
    return this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goTo(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.pageChange.emit(page);
  }
}
