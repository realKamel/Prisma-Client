import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffSideBar } from './staff-side-bar';

describe('StaffSideBar', () => {
  let component: StaffSideBar;
  let fixture: ComponentFixture<StaffSideBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffSideBar],
    }).compileComponents();

    fixture = TestBed.createComponent(StaffSideBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
