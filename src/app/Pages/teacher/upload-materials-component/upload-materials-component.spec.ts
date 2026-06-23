import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadMaterialsComponent } from './upload-materials-component';

describe('UploadMaterialsComponent', () => {
  let component: UploadMaterialsComponent;
  let fixture: ComponentFixture<UploadMaterialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadMaterialsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadMaterialsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
