import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChaptersSectionComponent } from './chapters-section-component';

describe('ChaptersSectionComponent', () => {
  let component: ChaptersSectionComponent;
  let fixture: ComponentFixture<ChaptersSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChaptersSectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChaptersSectionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
