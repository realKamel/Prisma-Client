import { Component, OnInit } from '@angular/core';
import { Signal } from '@angular/core';

import { FinancesHeaderComponent } from './components/finances-header/finances-header.component';
import { FinancesSummaryComponent } from './components/finances-summary/finances-summary.component';
import { FinancesTransactionsComponent } from './components/finances-transactions/finances-transactions.component';
import { FinanceSummary } from '../../../core/Models/Teacher/finance-summary.model';
import { Transaction } from '../../../core/Models/Teacher/transaction.model';
import { FinancesService } from '../../../core/Services/finances.service';

@Component({
  selector: 'app-finances-page',
  standalone: true,
  imports: [
    FinancesHeaderComponent,
    FinancesSummaryComponent,
    FinancesTransactionsComponent,
  ],
  templateUrl: './finances-page.component.html',
})
export class FinancesPageComponent implements OnInit {
  readonly summary: Signal<FinanceSummary>;
  readonly transactions: Signal<Transaction[]>;
  readonly loading: Signal<boolean>;

  constructor(private readonly financesService: FinancesService) {
    this.summary = financesService.summary;
    this.transactions = financesService.transactions;
    this.loading = financesService.loading;
  }

  ngOnInit(): void {
    this.financesService.loadFinances();
  }
}