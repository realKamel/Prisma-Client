import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LessonsToolbarComponent } from './lessons-toolbar-component';

describe('LessonsToolbarComponent', () => {
  let component: LessonsToolbarComponent;
  let fixture: ComponentFixture<LessonsToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LessonsToolbarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LessonsToolbarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
