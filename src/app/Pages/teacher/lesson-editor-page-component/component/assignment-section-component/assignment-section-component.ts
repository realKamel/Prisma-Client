import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-assignment-section',
  imports: [ReactiveFormsModule],
  templateUrl: './assignment-section-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignmentSectionComponent {
  // Input & Output Signals
  readonly form = input.required<FormGroup>();
  readonly initialFileUrl = input<string | null>(null);

  readonly toggle = output<void>();
  readonly fileSelected = output<File | null>();

  // Reactive State Signals
  readonly preview = signal<string | null>(null);
  readonly fileName = signal<string | null>(null);
  readonly isImage = signal<boolean>(false);

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

  onFileChange(event: Event): void {
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

  clear(inputElement: HTMLInputElement): void {
    inputElement.value = '';
    this.preview.set(null);
    this.fileName.set(null);
    this.isImage.set(false);
    this.fileSelected.emit(null);
  }
}
