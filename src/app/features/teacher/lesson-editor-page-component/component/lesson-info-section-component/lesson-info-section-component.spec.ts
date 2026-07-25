import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LessonInfoSectionComponent } from './lesson-info-section-component';

describe('LessonInfoSectionComponent', () => {
  let component: LessonInfoSectionComponent;
  let fixture: ComponentFixture<LessonInfoSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LessonInfoSectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LessonInfoSectionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
