import { Component, OnInit, inject } from '@angular/core';
import { Signal } from '@angular/core';
import { FinancesHeaderComponent } from './components/finances-header/finances-header.component';
import { FinancesSummaryComponent } from './components/finances-summary/finances-summary.component';
import { FinancesChart } from './components/finances-chart/finances-chart';
import { FinancesTransactionsComponent } from './components/finances-transactions/finances-transactions.component';
import { FinanceSummary } from '../../../core/Models/Teacher/finance-summary.model';
import { Transaction } from '../../../core/Models/Teacher/transaction.model';
import { MonthlyRevenuePoint } from '../../../core/Models/Teacher/finance-summary.model';
import { FinancesService } from '../../../core/Services/finances.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-finances-page',
  imports: [
    FinancesHeaderComponent,
    FinancesSummaryComponent,
    FinancesChart,
    FinancesTransactionsComponent,
  ],
  templateUrl: './finances-page.component.html',
})
export class FinancesPageComponent implements OnInit {
  private readonly financesService = inject(FinancesService);

  readonly summary: Signal<FinanceSummary>;
  readonly monthlyRevenue: Signal<MonthlyRevenuePoint[]>;
  readonly transactions: Signal<Transaction[]>;
  readonly loading: Signal<boolean>;

  constructor() {
    const financesService = this.financesService;
    this.summary = financesService.summary;
    this.monthlyRevenue = financesService.monthlyRevenue;
    this.transactions = financesService.transactions;
    this.loading = financesService.loading;
  }

  ngOnInit(): void {
    this.financesService.loadFinances();
  }
}
