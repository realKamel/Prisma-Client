import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { output } from '@angular/core';

@Component({
  selector: 'app-image-upload-add',
  imports: [],
  templateUrl: './image-upload.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageUploadAdd {
  // Output Signals
  readonly fileSelected = output<File | null>();

  // Core State Signals
  readonly preview = signal<string | null>(null);

  onFileChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement.files?.[0];

    if (file) {
      this.fileSelected.emit(file);
      const reader = new FileReader();
      reader.onload = () => {
        this.preview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  clear(inputElement: HTMLInputElement): void {
    inputElement.value = '';
    this.preview.set(null);
    this.fileSelected.emit(null);
  }
}
