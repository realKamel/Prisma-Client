import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LessonEditorPageComponent } from './lesson-editor-page-component';

describe('LessonEditorPageComponent', () => {
  let component: LessonEditorPageComponent;
  let fixture: ComponentFixture<LessonEditorPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LessonEditorPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LessonEditorPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
