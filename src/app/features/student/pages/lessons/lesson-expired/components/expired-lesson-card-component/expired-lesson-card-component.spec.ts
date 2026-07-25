import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpiredLessonCardComponent } from './expired-lesson-card-component';

describe('ExpiredLessonCardComponent', () => {
  let component: ExpiredLessonCardComponent;
  let fixture: ComponentFixture<ExpiredLessonCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpiredLessonCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpiredLessonCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
