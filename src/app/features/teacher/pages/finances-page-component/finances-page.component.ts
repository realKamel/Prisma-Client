import { Component, OnInit, Signal, inject } from '@angular/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { FinanceSummary, MonthlyRevenuePoint } from '../../models/finance-summary.model';
import { Transaction } from '../../models/transaction.model';
import { FinancesChartComponent } from './components/finances-chart/finances-chart';
import { FinancesHeaderComponent } from './components/finances-header/finances-header.component';
import { FinancesSummaryComponent } from './components/finances-summary/finances-summary.component';
import { FinancesTransactionsComponent } from './components/finances-transactions/finances-transactions.component';
import { FinancesService } from './services/finances.service';

@Component({
  selector: 'app-finances-page',
  imports: [
    FinancesHeaderComponent,
    FinancesSummaryComponent,
    FinancesChartComponent,
    FinancesTransactionsComponent,
    NgmMotionDirective,
  ],
  templateUrl: './finances-page.component.html',
})
export class FinancesPageComponent implements OnInit {
  private readonly financesService = inject(FinancesService);

  protected readonly summary: Signal<FinanceSummary> = this.financesService.summary;
  protected readonly monthlyRevenue: Signal<MonthlyRevenuePoint[]> =
    this.financesService.monthlyRevenue;
  protected readonly transactions: Signal<Transaction[]> = this.financesService.transactions;
  protected readonly loading: Signal<boolean> = this.financesService.loading;

  public ngOnInit(): void {
    this.financesService.loadFinances();
  }
}
