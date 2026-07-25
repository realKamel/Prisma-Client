import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishSuccessModalComponent } from './publish-success-modal-component';

describe('PublishSuccessModalComponent', () => {
  let component: PublishSuccessModalComponent;
  let fixture: ComponentFixture<PublishSuccessModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublishSuccessModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PublishSuccessModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
