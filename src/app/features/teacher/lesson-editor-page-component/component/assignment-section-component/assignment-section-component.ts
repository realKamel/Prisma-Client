import { Component, effect, inject, input, output, signal } from '@angular/core';
import { ControlContainer, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  bootstrapCloudArrowUp,
  bootstrapFileEarmarkPdf,
  bootstrapFileEarmarkText,
  bootstrapXLg,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { FieldError } from '../field-error/field-error';

@Component({
  selector: 'app-assignment-section',
  imports: [ReactiveFormsModule, NgIcon, FieldError],
  templateUrl: './assignment-section-component.html',
  viewProviders: [
    provideIcons({
      bootstrapFileEarmarkText,
      bootstrapCloudArrowUp,
      bootstrapFileEarmarkPdf,
      bootstrapXLg,
    }),
  ],
})
export class AssignmentSectionComponent {
  /** Explicit group, for usage outside a `formGroupName` (the lesson editor). */
  public readonly form = input<FormGroup | null>(null);
  public readonly initialFileUrl = input<string | null>(null);

  public readonly toggleQuery = output<void>();
  public readonly fileSelected = output<File | null>();

  private readonly container = inject(ControlContainer, { optional: true });

  /**
   * `FormGroupName` assigns its control in `ngOnChanges`, after this component is created,
   * so the group is resolved lazily instead of in the constructor.
   */
  protected get formGroup(): FormGroup {
    const explicit = this.form();
    if (explicit) return explicit;

    const inherited = this.container?.control;
    if (!(inherited instanceof FormGroup)) {
      throw new Error('app-assignment-section needs a [form] input or an ancestor formGroupName.');
    }

    return inherited;
  }

  // Reactive State Signals
  protected readonly preview = signal<string | null>(null);
  protected readonly fileName = signal<string | null>(null);
  protected readonly isImage = signal<boolean>(false);

  constructor() {
    // Replaces ngOnChanges dynamically when initialFileUrl changes
    effect(() => {
      const url = this.initialFileUrl();
      if (url && !this.fileName()) {
        const extractedName = url.split('/').pop() ?? url;
        const matchesImage = /\.(png|jpe?g|gif|webp)$/i.test(url);

        this.fileName.set(extractedName);
        this.isImage.set(matchesImage);
        this.preview.set(matchesImage ? url : null);
      }
    });
  }

  protected onFileChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement.files?.[0];
    if (!file) return;

    this.fileName.set(file.name);
    this.isImage.set(file.type.startsWith('image/'));

    this.fileSelected.emit(file);

    if (this.isImage()) {
      const reader = new FileReader();
      reader.onload = () => {
        this.preview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      this.preview.set(null);
    }
  }

  protected clear(inputElement: HTMLInputElement): void {
    inputElement.value = '';
    this.preview.set(null);
    this.fileName.set(null);
    this.isImage.set(false);
    this.fileSelected.emit(null);
  }
}
