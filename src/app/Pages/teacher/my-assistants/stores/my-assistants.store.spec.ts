import { TestBed } from '@angular/core/testing';

import { MyAssistantsStore } from './my-assistants.store';

describe('MyAssistantsStore', () => {
  let service: MyAssistantsStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyAssistantsStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
