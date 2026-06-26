import { Component, EventEmitter, ChangeDetectorRef, inject, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-upload-add',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-upload.html',
})
export class ImageUploadAdd {
  @Output() fileSelected = new EventEmitter<string>();
  private cdr = inject(ChangeDetectorRef);
  preview: string | null = null;

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.fileSelected.emit(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        this.preview = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  clear(input: HTMLInputElement): void {
    input.value = '';
    this.preview = null;
    this.fileSelected.emit('');
    this.cdr.detectChanges();
  }
}