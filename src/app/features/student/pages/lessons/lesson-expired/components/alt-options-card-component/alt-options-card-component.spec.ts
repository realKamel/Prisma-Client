import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AltOptionsCardComponent } from './alt-options-card-component';

describe('AltOptionsCardComponent', () => {
  let component: AltOptionsCardComponent;
  let fixture: ComponentFixture<AltOptionsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AltOptionsCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AltOptionsCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
