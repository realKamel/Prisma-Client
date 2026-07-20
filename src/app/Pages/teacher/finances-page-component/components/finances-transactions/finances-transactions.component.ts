import { Component, input } from '@angular/core';
import { Transaction } from '../../../../../core/Models/Teacher/transaction.model';
import { DatePipe, DecimalPipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapInbox } from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-finances-transactions',
  imports: [DatePipe, DecimalPipe, NgIcon],
  templateUrl: './finances-transactions.component.html',
  viewProviders: [
    provideIcons({
      bootstrapInbox,
    }),
  ],
})
export class FinancesTransactionsComponent {
  readonly transactions = input<Transaction[]>([]);
  readonly loading = input<boolean>(false);
}
