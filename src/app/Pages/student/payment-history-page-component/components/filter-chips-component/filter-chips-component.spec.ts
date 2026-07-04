import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterChipsComponent } from './filter-chips-component';

describe('FilterChipsComponent', () => {
  let component: FilterChipsComponent;
  let fixture: ComponentFixture<FilterChipsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterChipsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterChipsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
