import { Component, effect, input, output, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  bootstrapCloudArrowUp,
  bootstrapFileEarmarkPdf,
  bootstrapFileEarmarkText,
  bootstrapXLg,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';

@Component({
  selector: 'app-assignment-section',
  imports: [ReactiveFormsModule, NgIcon],
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
  // Input & Output Signals
  public readonly form = input.required<FormGroup>();
  public readonly initialFileUrl = input<string | null>(null);

  public readonly toggleQuery = output<void>();
  public readonly fileSelected = output<File | null>();

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
