import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from './input.component';

@Component({
  imports: [InputComponent, ReactiveFormsModule],
  template: `
    <app-input
      type="tel"
      label="Phone"
      [formControl]="control"
      [errorMessage]="control.invalid && control.touched ? 'Required' : null"
    />
  `,
})
class TestHostComponent {
  readonly control = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required],
  });
}

describe('InputComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let input: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHostComponent] }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    await fixture.whenStable();
    input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
  });

  it('should create', () => {
    expect(host).toBeTruthy();
  });

  it('writes the control value into the native input', async () => {
    host.control.setValue('01234567890');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(input.value).toBe('01234567890');
  });

  it('propagates typing back to the control', () => {
    input.value = '01012345678';
    input.dispatchEvent(new Event('input'));

    expect(host.control.value).toBe('01012345678');
  });

  it('strips non-digits from tel values', () => {
    input.value = '0101-abc234';
    input.dispatchEvent(new Event('input'));

    expect(host.control.value).toBe('0101234');
    expect(input.value).toBe('0101234');
  });

  it('marks the control touched and renders the error after blur', async () => {
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(host.control.touched).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Required');
  });

  it('reflects the disabled state of the control', () => {
    host.control.disable();
    fixture.detectChanges();

    expect(input.disabled).toBe(true);
  });

  it('applies the invalid border once the field is touched', async () => {
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(input.className).toContain('border-coral');
  });
});
