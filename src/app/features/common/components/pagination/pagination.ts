import { Component, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-pagination',
  imports:[DecimalPipe],
  templateUrl: './pagination.html',
})
export class Pagination {

  currentPage = input.required<number>();
  totalPages = input.required<number>();
  pagesArray = input.required<number[]>();
  pageChange = output<number>();
}
