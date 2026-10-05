import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { DeleteModalComponent } from './delete-modal.component';

describe('DeleteModalComponent', () => {
  let component: DeleteModalComponent;
  let fixture: ComponentFixture<DeleteModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteModalComponent],
      providers: [
        provideTranslateService(),
        { provide: DIALOG_DATA, useValue: { title: 'Lesson' } },
        { provide: DialogRef, useValue: { close: () => undefined } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fall back to the generic translated message when none is provided', () => {
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', {
      COMMON: { DELETE_MODAL: { MESSAGE: 'Are you sure you want to delete "{{title}}"?' } },
    });
    translate.use('en');

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Are you sure you want to delete "Lesson"?',
    );
  });
});
