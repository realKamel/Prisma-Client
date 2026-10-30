import { TestBed } from '@angular/core/testing';
import { LessonApiService } from './lesson-api.service';

describe('LessonApiService', () => {
  let service: LessonApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LessonApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
