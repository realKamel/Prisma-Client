import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentSectionAddComponent } from './assignment-section-component';

describe('AssignmentSectionComponent', () => {
  let component: AssignmentSectionAddComponent;
  let fixture: ComponentFixture<AssignmentSectionAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignmentSectionAddComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignmentSectionAddComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
