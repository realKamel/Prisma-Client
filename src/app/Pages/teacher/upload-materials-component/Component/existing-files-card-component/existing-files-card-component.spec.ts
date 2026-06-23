import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExistingFilesCardComponent } from './existing-files-card-component';

describe('ExistingFilesCardComponent', () => {
  let component: ExistingFilesCardComponent;
  let fixture: ComponentFixture<ExistingFilesCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExistingFilesCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExistingFilesCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
