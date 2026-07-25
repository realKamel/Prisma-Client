import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LessonUploadCardComponent } from './lesson-upload-card-component';

describe('LessonUploadCardComponent', () => {
  let component: LessonUploadCardComponent;
  let fixture: ComponentFixture<LessonUploadCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LessonUploadCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LessonUploadCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
