import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { PaymentHistoryService } from '../../../../domain/payments/services/payment/payment-history.service';
import {
  cardEntranceTransition,
  pageEntranceAnimate,
  pageEntranceInitial,
  pageEntranceTransition,
  stateSwapTransition,
} from '../../../../shared/animations/motion.animations';
import {
  PaymentFilter,
  PaymentFilterCounts,
  PaymentHistoryStatsDto,
  PaymentRecordDto,
} from '../../models/payment-history.model';
import { BreadcrumbComponent } from './components/breadcrumb-component/breadcrumb-component';
import { FilterChipsComponent } from './components/filter-chips-component/filter-chips-component';
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
    NgmMotionDirective,
  ],
  templateUrl: './payment-history-page-component.html',
})
export class PaymentHistoryPageComponent {
  private readonly paymentHistoryService = inject(PaymentHistoryService);

  protected readonly pageInitial = pageEntranceInitial;
  protected readonly pageAnimate = pageEntranceAnimate;
  protected readonly pageTransition = pageEntranceTransition;
  protected readonly cardTransition = cardEntranceTransition;
  protected readonly stateTransition = stateSwapTransition;

  private readonly response = toSignal(this.paymentHistoryService.getPaymentHistory());

  readonly stats = computed<PaymentHistoryStatsDto>(() => this.response()?.stats ?? EMPTY_STATS);
  readonly payments = computed<PaymentRecordDto[]>(() => this.response()?.payments ?? []);

  readonly activeFilter = signal<PaymentFilter>('ALL');

  readonly filteredPayments = computed<PaymentRecordDto[]>(() => {
    const filter = this.activeFilter();
    const all = this.payments();
    return filter === 'ALL' ? all : all.filter((p) => p.method === filter);
  });

  readonly filterCounts = computed<PaymentFilterCounts>(() => {
    const all = this.payments();
    return {
      ALL: all.length,
      ONLINE: all.filter((p) => p.method === 'ONLINE').length,
      CODE: all.filter((p) => p.method === 'CODE').length,
      TEACHER_GRANT: all.filter((p) => p.method === 'TEACHER_GRANT').length,
    };
  });
}
