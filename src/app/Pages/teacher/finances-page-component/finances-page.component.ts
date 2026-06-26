import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';


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
    CommonModule,
    FinancesHeaderComponent,
    FinancesSummaryComponent,
    FinancesTransactionsComponent,
  ],
  templateUrl: './finances-page.component.html',
})
export class FinancesPageComponent implements OnInit {
  summary$: Observable<FinanceSummary | null>;
  transactions$: Observable<Transaction[]>;
  loading$: Observable<boolean>;

  constructor(private readonly financesService: FinancesService) {
    this.summary$ = this.financesService.summary$;
    this.transactions$ = this.financesService.transactions$;
    this.loading$ = this.financesService.loading$;
  }

  ngOnInit(): void {
    this.financesService.loadFinances();
  }
}
