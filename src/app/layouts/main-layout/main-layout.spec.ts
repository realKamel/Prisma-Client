import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainLayoutPageComponent } from './main-layout';

describe('MainLayout', () => {
  let component: MainLayoutPageComponent;
  let fixture: ComponentFixture<MainLayoutPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayoutPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
