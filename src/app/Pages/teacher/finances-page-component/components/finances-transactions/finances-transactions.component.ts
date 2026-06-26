import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transaction } from '../../../../../core/Models/Teacher/transaction.model';
import { ArDatePipe } from '../../../../../core/pipes/ar-date.pipe';
import { ArNumberPipe } from '../../../../../core/pipes/ar-number.pipe';

@Component({
  selector: 'app-finances-transactions',
  standalone: true,
  imports: [CommonModule, ArDatePipe, ArNumberPipe],
  templateUrl: './finances-transactions.component.html',
})
export class FinancesTransactionsComponent {
  @Input() transactions: Transaction[] = [];
  @Input() loading: boolean = false;
}