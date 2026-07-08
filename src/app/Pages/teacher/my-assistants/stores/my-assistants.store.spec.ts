import { TestBed } from '@angular/core/testing';

import { AssistantsStore } from './my-assistants.store';

describe('AssistantsStore', () => {
  let service: AssistantsStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssistantsStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
