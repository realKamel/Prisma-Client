import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Assignment } from '../../../../../../core/Models/Lesson/Lesson-Player';


@Component({
  selector: 'app-assignment-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assignment-tab.html'
})
export class AssignmentTab implements OnInit {
  @Input() assignment!: Assignment | null;

  isDragOver: boolean = false;
  hasFileSelected: boolean = false;
  isSubmitted: boolean = false;
  isSubmitting: boolean = false;
  fileName: string = '';
  fileSize: string = '';

  private submissionKey!: string;
  private fileNameKey!: string;
  private fileSizeKey!: string;

  ngOnInit(): void {
    // بناء مفاتيح تخزين فريدة لكل درس لمنع تداخل حالة الواجبات
    this.submissionKey = `assignment_submitted_lesson_${this.assignment?.id}`;
    this.fileNameKey = `assignment_filename_lesson_${this.assignment?.id}`;
    this.fileSizeKey = `assignment_filesize_lesson_${this.assignment?.id}`;

    // استعادة حالة التسليم السابقة للدرس الحالي إن وجدت
    if (localStorage.getItem(this.submissionKey) === 'true') {
      this.isSubmitted = true;
      this.fileName = localStorage.getItem(this.fileNameKey) || '';
      this.fileSize = localStorage.getItem(this.fileSizeKey) || '';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(): void {
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  onFileBrowse(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File): void {
    this.fileName = file.name;
    this.fileSize = (file.size / (1024 * 1024)).toFixed(2) + ' ميجابايت';
    this.hasFileSelected = true;
  }

  removeFile(): void {
    this.hasFileSelected = false;
    this.fileName = '';
    this.fileSize = '';
  }

  submitAssignment(): void {  
    if (!this.hasFileSelected || !this.assignment) return;
    this.isSubmitting = true;
 // TODO: replace with real upload + submit flow once storage is decided
  // 1. upload file to storage → get fileUrl
  // 2. POST /assignments/{id}/submit with { fileUrl }
      this.isSubmitted = true;
      this.isSubmitting = false;
      // حفظ حالة التسليم وبيانات الملف محلياً للدرس الحالي
      localStorage.setItem(this.submissionKey, 'true');
      localStorage.setItem(this.fileNameKey, this.fileName);
      localStorage.setItem(this.fileSizeKey, this.fileSize);
    
  }

  resetUpload(): void {
    this.isSubmitted = false;
    // مسح الحفظ المحلي الخاص بهذا الدرس عند الرغبة في التعديل
    localStorage.removeItem(this.submissionKey);
    localStorage.removeItem(this.fileNameKey);
    localStorage.removeItem(this.fileSizeKey);
    this.removeFile();
  }
}