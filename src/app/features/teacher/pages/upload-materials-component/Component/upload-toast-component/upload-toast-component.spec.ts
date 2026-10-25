import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadToastComponent } from './upload-toast-component';

describe('UploadToastComponent', () => {
  let component: UploadToastComponent;
  let fixture: ComponentFixture<UploadToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadToastComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadToastComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
