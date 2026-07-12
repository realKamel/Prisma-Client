import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ArNumberPipe } from '../../../../../core/pipes/ar-number.pipe';
import { PaymentFilter } from '../../../../../core/Models/Student/payment-history.model';


export interface PaymentFilterCounts {
  all: number;
  online: number;
  code: number;
  'teacher grant': number;
}

interface FilterChipConfig {
  key: PaymentFilter;
  label: string;
}

@Component({
  selector: 'app-filter-chips',
  standalone: true,
  imports: [ArNumberPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
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