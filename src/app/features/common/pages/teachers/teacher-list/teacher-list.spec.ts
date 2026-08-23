import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { TeacherList } from './teacher-list';

describe('TeacherList', () => {
  let component: TeacherList;
  let fixture: ComponentFixture<TeacherList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherList],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
