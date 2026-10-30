import { TestBed } from '@angular/core/testing';
import { LessonPlayerApiService } from './lesson-player-api.service';

describe('LessonPlayerApiService', () => {
  let service: LessonPlayerApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LessonPlayerApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
