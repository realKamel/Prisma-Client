import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-assignment-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './assignment-section-component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class AssignmentSectionComponent implements OnChanges {

  @Input({ required: true }) form!: FormGroup;

  // ده بيفضل زي ما هو: مجرد URL لعرض الملف الموجود فعلاً عند التعديل
  @Input() initialFileUrl: string | null = null;

  @Output() toggle = new EventEmitter<void>();

  // قبل كده كان بيبعت اسم الملف بس (string)، دلوقتي بيبعت الملف الحقيقي (File)
  // لو المستخدم مختارش ملف جديد، الأب هيفضل معتمد على initialFileUrl اللي جاي من السيرفر
  @Output() fileSelected = new EventEmitter<File | null>();

  private cdr = inject(ChangeDetectorRef);

  preview: string | null = null;
  fileName: string | null = null;
  isImage = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialFileUrl'] && this.initialFileUrl && !this.fileName) {
      this.fileName = this.initialFileUrl.split('/').pop() ?? this.initialFileUrl;
      this.isImage = /\.(png|jpe?g|gif|webp)$/i.test(this.initialFileUrl);
      this.preview = this.isImage ? this.initialFileUrl : null;
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.fileName = file.name;
    this.isImage = file.type.startsWith('image/');

    // بنبعت الـ File نفسه للأب عشان يضيفه في الـ FormData وقت الإرسال
    this.fileSelected.emit(file);

    if (this.isImage) {
      const reader = new FileReader();
      reader.onload = () => {
        this.preview = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    } else {
      this.preview = null;
      this.cdr.detectChanges();
    }
  }

  clear(input: HTMLInputElement): void {
    input.value = '';
    this.preview = null;
    this.fileName = null;
    this.isImage = false;
    this.fileSelected.emit(null);
    this.cdr.detectChanges();
  }
}