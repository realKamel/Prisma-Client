import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentCardComponent } from './payment-card-component';

describe('PaymentCardComponent', () => {
  let component: PaymentCardComponent;
  let fixture: ComponentFixture<PaymentCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
