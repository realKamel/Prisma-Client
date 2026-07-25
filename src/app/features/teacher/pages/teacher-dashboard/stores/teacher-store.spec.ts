import { TestBed } from '@angular/core/testing';

import { TeacherStore } from './teacher-store';

describe('TeacherStore', () => {
  let service: TeacherStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TeacherStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
