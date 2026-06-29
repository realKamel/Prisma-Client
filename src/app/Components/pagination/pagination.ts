import { Component, input, output } from '@angular/core';
import { toArabicNumerals } from '../../core/pipes/arabic-numerals/arabic-numerals';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  imports: [CommonModule],
  templateUrl: './pagination.html',
})
export class Pagination {
  readonly toAr = toArabicNumerals;

  currentPage = input.required<number>();
  totalPages = input.required<number>();
  pagesArray = input.required<number[]>();
  pageChange = output<number>();
}
