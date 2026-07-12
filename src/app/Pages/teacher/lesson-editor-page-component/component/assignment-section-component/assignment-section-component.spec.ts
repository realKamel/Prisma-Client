import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentSectionComponent } from './assignment-section-component';

describe('AssignmentSectionComponent', () => {
  let component: AssignmentSectionComponent;
  let fixture: ComponentFixture<AssignmentSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignmentSectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignmentSectionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
