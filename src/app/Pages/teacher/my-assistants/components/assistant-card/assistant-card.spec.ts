import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssistantCard } from './assistant-card';

describe('AssistantCard', () => {
  let component: AssistantCard;
  let fixture: ComponentFixture<AssistantCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssistantCard],
    }).compileComponents();

    fixture = TestBed.createComponent(AssistantCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
