import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherLessonsComponent } from './teacher-lessons-component';

describe('TeacherLessonsComponent', () => {
  let component: TeacherLessonsComponent;
  let fixture: ComponentFixture<TeacherLessonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherLessonsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherLessonsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
