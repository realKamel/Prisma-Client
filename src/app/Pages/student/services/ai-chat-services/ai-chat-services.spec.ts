import { TestBed } from '@angular/core/testing';

import { AiChatServices } from './ai-chat-services';

describe('AiChatServices', () => {
  let service: AiChatServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiChatServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
