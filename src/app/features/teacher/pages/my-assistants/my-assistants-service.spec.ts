import { TestBed } from '@angular/core/testing';

import { MyAssistantsService } from './my-assistants-service';

describe('MyAssistantsService', () => {
  let service: MyAssistantsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyAssistantsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
