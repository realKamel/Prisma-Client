import { DecimalPipe } from '@angular/common';
import {
  PaymentFilter,
  PaymentFilterCounts,
} from '../../../../../../core/Models/Student/payment-history.model';
import { Component, input, output } from '@angular/core';

interface FilterChipConfig {
  key: PaymentFilter;
  label: string;
}

@Component({
  selector: 'app-filter-chips',
  imports: [DecimalPipe],
  templateUrl: './filter-chips-component.html',
})
export class FilterChipsComponent {
  readonly counts = input.required<PaymentFilterCounts>();
  readonly activeFilter = input<PaymentFilter>('all');
  readonly filterChange = output<PaymentFilter>();

  readonly chips: FilterChipConfig[] = [
    { key: 'all', label: 'الكل' },
    { key: 'online', label: 'أونلاين' },
    { key: 'code', label: 'كود' },
    { key: 'teacher grant', label: 'منح معلم' },
  ];
}
