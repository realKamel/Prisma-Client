import { TestBed } from '@angular/core/testing';
import { LessonStoreStore } from './lesson.store';

describe('LessonStoreStore', () => {
  let service: LessonStoreStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LessonStoreStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
