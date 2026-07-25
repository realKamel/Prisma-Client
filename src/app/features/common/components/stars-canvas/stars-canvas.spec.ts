import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarsCanvas } from './stars-canvas';

describe('StarsCanvas', () => {
  let component: StarsCanvas;
  let fixture: ComponentFixture<StarsCanvas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StarsCanvas],
    }).compileComponents();

    fixture = TestBed.createComponent(StarsCanvas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
