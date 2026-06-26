import { ComponentFixture, TestBed } from '@angular/core/testing';


describe('FinancesPageComponent', () => {
  let component: FinancesPageComponent;
  let fixture: ComponentFixture<FinancesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancesPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FinancesPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
