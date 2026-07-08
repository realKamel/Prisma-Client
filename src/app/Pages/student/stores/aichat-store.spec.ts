import { TestBed } from '@angular/core/testing';

import { AIChatStore } from './aichat-store';

describe('AIChatStore', () => {
  let service: AIChatStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AIChatStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
