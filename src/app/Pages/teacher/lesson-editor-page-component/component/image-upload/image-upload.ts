import { CommonModule } from '@angular/common';
import { Component, EventEmitter, ChangeDetectorRef, inject, Output, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-upload.html',
})
export class ImageUpload {
  // قبل كده كان بيبعت اسم الملف بس (string)، دلوقتي بيبعت الملف الحقيقي (File)
  // لو المستخدم مختارش صورة جديدة، الأب هيفضل معتمد على initialPreview الجاي من السيرفر
  @Output() fileSelected = new EventEmitter<File | null>();
  @Input() initialPreview: string | null = null;

  ngOnInit(): void {
    if (this.initialPreview) {
      this.preview = this.initialPreview;
    }
  }
  private cdr = inject(ChangeDetectorRef);

  preview: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialPreview']?.currentValue) {
      this.preview = changes['initialPreview'].currentValue;
      this.cdr.detectChanges();
    }
  }
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.fileSelected.emit(file);
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
    this.fileSelected.emit(null);
    this.cdr.detectChanges();
  }
}