import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionButton } from './permission-button';

describe('PermissionButton', () => {
  let component: PermissionButton;
  let fixture: ComponentFixture<PermissionButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionButton],
    }).compileComponents();

    fixture = TestBed.createComponent(PermissionButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
