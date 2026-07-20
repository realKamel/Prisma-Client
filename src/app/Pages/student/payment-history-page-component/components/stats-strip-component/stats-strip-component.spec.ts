import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsStripComponent } from './stats-strip-component';

describe('StatsStripComponent', () => {
  let component: StatsStripComponent;
  let fixture: ComponentFixture<StatsStripComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsStripComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatsStripComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
