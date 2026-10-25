import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { bootstrapInbox } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Transaction } from '../../../../../core/Models/Teacher/transaction.model';

@Component({
  selector: 'app-finances-transactions',
  imports: [DatePipe, DecimalPipe, NgIcon, CurrencyPipe],
  templateUrl: './finances-transactions.component.html',
  viewProviders: [
    provideIcons({
      bootstrapInbox,
    }),
  ],
})
export class FinancesTransactionsComponent {
  public readonly transactions = input<Transaction[]>([]);
  public readonly loading = input<boolean>(false);
}
