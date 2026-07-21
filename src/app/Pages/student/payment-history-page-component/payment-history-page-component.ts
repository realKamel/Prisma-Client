import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  PaymentHistoryStatsDto,
  PaymentRecordDto,
  PaymentFilter,
} from '../../../core/Models/Student/payment-history.model';
import { PaymentHistoryService } from '../../../core/Services/payment-history.service';
import { BreadcrumbComponent } from './components/breadcrumb-component/breadcrumb-component';
import {
  FilterChipsComponent,
  PaymentFilterCounts,
} from './components/filter-chips-component/filter-chips-component';
import { PageHeaderComponent } from './components/page-header-component/page-header-component';
import { PaymentListComponent } from './components/payment-list-component/payment-list-component';
import { StatsStripComponent } from './components/stats-strip-component/stats-strip-component';

const EMPTY_STATS: PaymentHistoryStatsDto = {
  totalAmount: 0,
  lessonsPurchased: 0,
  activeLessons: 0,
  expiredLessons: 0,
};

@Component({
  selector: 'app-payment-history-page',

  imports: [
    BreadcrumbComponent,
    PageHeaderComponent,
    StatsStripComponent,
    FilterChipsComponent,
    PaymentListComponent,
  ],
  templateUrl: './payment-history-page-component.html',
})
export class PaymentHistoryPageComponent {
  private readonly paymentHistoryService = inject(PaymentHistoryService);

  private readonly response = toSignal(this.paymentHistoryService.getPaymentHistory());

  readonly stats = computed<PaymentHistoryStatsDto>(() => this.response()?.stats ?? EMPTY_STATS);
  readonly payments = computed<PaymentRecordDto[]>(() => this.response()?.payments ?? []);

  readonly activeFilter = signal<PaymentFilter>('all');

  readonly filteredPayments = computed<PaymentRecordDto[]>(() => {
    const filter = this.activeFilter();
    const all = this.payments();
    return filter === 'all' ? all : all.filter((p) => p.method === filter);
  });

  readonly filterCounts = computed<PaymentFilterCounts>(() => {
    const all = this.payments();
    return {
      all: all.length,
      online: all.filter((p) => p.method === 'online').length,
      code: all.filter((p) => p.method === 'code').length,
      'teacher grant': all.filter((p) => p.method === 'teacher grant').length,
    };
  });
}
