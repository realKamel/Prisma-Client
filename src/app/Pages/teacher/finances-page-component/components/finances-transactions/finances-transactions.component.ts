import { Component, input } from '@angular/core';

import { Transaction } from '../../../../../core/Models/Teacher/transaction.model';
import { ArDatePipe } from '../../../../../core/pipes/ar-date.pipe';
import { ArNumberPipe } from '../../../../../core/pipes/ar-number.pipe';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-finances-transactions',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './finances-transactions.component.html',
})
export class FinancesTransactionsComponent {
  readonly transactions = input<Transaction[]>([]);
  readonly loading = input<boolean>(false);
}
