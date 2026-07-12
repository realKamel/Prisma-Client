import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenewalCardComponent } from './renewal-card-component';

describe('RenewalCardComponent', () => {
  let component: RenewalCardComponent;
  let fixture: ComponentFixture<RenewalCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RenewalCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RenewalCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
