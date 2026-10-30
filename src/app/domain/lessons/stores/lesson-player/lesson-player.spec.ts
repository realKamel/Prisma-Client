import { TestBed } from '@angular/core/testing';
import { LessonPlayerStore } from './lesson-player.store';

describe('LessonPlayerStore', () => {
  let service: LessonPlayerStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LessonPlayerStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
