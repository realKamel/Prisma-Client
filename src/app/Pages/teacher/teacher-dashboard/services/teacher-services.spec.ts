import { TestBed } from '@angular/core/testing';

import { TeacherServices } from './teacher-services';

describe('TeacherServices', () => {
  let service: TeacherServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TeacherServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
