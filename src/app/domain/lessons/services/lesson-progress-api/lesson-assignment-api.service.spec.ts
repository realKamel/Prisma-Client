import { TestBed } from '@angular/core/testing';
import { LessonAssignmentApiService } from './lesson-assignment-api.service';

describe('LessonAssignmentApiService', () => {
  let service: LessonAssignmentApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LessonAssignmentApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
