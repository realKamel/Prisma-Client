import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VidstackPlayer } from './vidstack-player';

describe('VidstackPlayer', () => {
  let component: VidstackPlayer;
  let fixture: ComponentFixture<VidstackPlayer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VidstackPlayer],
    }).compileComponents();

    fixture = TestBed.createComponent(VidstackPlayer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
