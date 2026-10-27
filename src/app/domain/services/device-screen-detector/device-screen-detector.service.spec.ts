import { TestBed } from '@angular/core/testing';
import { DeviceScreenDetectorService } from './device-screen-detector.service';
describe('DeviceScreenDetectorService', () => {
  let service: DeviceScreenDetectorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeviceScreenDetectorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
