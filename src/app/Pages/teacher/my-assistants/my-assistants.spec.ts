import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyAssistants } from './my-assistants';

describe('MyAssistants', () => {
  let component: MyAssistants;
  let fixture: ComponentFixture<MyAssistants>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyAssistants],
    }).compileComponents();

    fixture = TestBed.createComponent(MyAssistants);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
