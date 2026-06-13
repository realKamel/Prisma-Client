import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-payment-method',
  imports: [CommonModule],
  templateUrl: './payment-method-component.html'
})
export class PaymentMethodComponent {
  @Input() data: any;
  @Input() selected = false;
  @Output() select = new EventEmitter<string>();
}