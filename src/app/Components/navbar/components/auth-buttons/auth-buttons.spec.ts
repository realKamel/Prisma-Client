import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthButtons } from './auth-buttons';

describe('AuthButtons', () => {
  let component: AuthButtons;
  let fixture: ComponentFixture<AuthButtons>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthButtons],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthButtons);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
