import { DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import {
  PaymentFilter,
  PaymentFilterCounts,
} from '../../../../../../core/models/student/payment-history.model';

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
  readonly activeFilter = input<PaymentFilter>('ALL');
  readonly filterChange = output<PaymentFilter>();

  readonly chips: FilterChipConfig[] = [
    { key: 'ALL', label: 'الكل' },
    { key: 'ONLINE', label: 'أونلاين' },
    { key: 'CODE', label: 'كود' },
    { key: 'TEACHER_GRANT', label: 'منح معلم' },
  ];
}
