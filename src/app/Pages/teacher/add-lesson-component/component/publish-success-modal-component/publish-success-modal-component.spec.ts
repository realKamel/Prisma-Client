import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishSuccessModalAddComponent } from './publish-success-modal-component';

describe('PublishSuccessModalComponent', () => {
  let component: PublishSuccessModalAddComponent;
  let fixture: ComponentFixture<PublishSuccessModalAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublishSuccessModalAddComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PublishSuccessModalAddComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
