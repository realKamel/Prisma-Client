import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { input, output } from '@angular/core';
import {
  bootstrapFileEarmarkText,
  bootstrapCloudArrowUp,
  bootstrapFileEarmarkPdf,
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
  readonly form = input.required<FormGroup>();
  readonly toggle = output<void>();
  readonly fileSelected = output<File | null>();

  // Core State Signals
  readonly preview = signal<string | null>(null);
  readonly fileName = signal<string | null>(null);
  readonly isImage = signal<boolean>(false);

  onFileChange(event: Event): void {
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

  clear(inputElement: HTMLInputElement): void {
    inputElement.value = '';
    this.preview.set(null);
    this.fileName.set(null);
    this.isImage.set(false);
    this.fileSelected.emit(null);
  }
}
