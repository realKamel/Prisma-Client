import { Component, input, output, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  bootstrapCloudArrowUp,
  bootstrapFileEarmarkPdf,
  bootstrapFileEarmarkText,
  bootstrapXLg,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';

@Component({
  selector: 'app-assignment-section-add',
  imports: [ReactiveFormsModule, NgIcon],
  templateUrl: './assignment-section-component.html',
  providers: [
    provideIcons({
      bootstrapFileEarmarkText,
      bootstrapCloudArrowUp,
      bootstrapFileEarmarkPdf,
      bootstrapXLg,
    }),
  ],
})
export class AssignmentSectionAddComponent {
  // Input & Output Signals
  public readonly form = input.required<FormGroup>();
  public readonly toggleQuery = output<void>();
  public readonly fileSelected = output<File | null>();

  // Core State Signals
  protected readonly preview = signal<string | null>(null);
  protected readonly fileName = signal<string | null>(null);
  protected readonly isImage = signal<boolean>(false);

  protected onFileChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement.files?.[0];
    if (!file) return;

    this.fileName.set(file.name);
    const checkImage = file.type.startsWith('image/');
    this.isImage.set(checkImage);

    // بنبعت الـ File نفسه للأب عشان يضيفه في الـ FormData وقت الإرسال
    this.fileSelected.emit(file);

    if (checkImage) {
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
