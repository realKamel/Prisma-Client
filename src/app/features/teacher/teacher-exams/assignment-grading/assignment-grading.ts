import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { studentInitials } from '../../../../core/pipes/arabic-numerals/arabic-numerals';
import {
  AssignmentSubmissionDetail,
  AssignmentSubmissionListItem,
} from '../../../../core/Models/Teacher/assignment-model';
import { AssignmentGradeSubmitEvent } from '../../../../core/Models/Teacher/teacher-exams-model';
import { StorageService } from '../../../../core/Services/storage-service';
import { ToastService } from '../../../../core/Services/toast-service';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-assignment-grading',
  imports: [FormsModule, DatePipe, DecimalPipe],
  templateUrl: './assignment-grading.html',
})
export class AssignmentGrading {
  private readonly storageSvc = inject(StorageService);
  private readonly toast = inject(ToastService);

  readonly initials = studentInitials;

  show = input.required<boolean>();
  item = input<AssignmentSubmissionListItem | null>(null);
  detail = input<AssignmentSubmissionDetail | null>(null);
  loading = input<boolean>(false);
  saving = input<boolean>(false);

  close = output<void>();
  submitGrade = output<AssignmentGradeSubmitEvent>();

  score = signal<number | null>(null);
  note = signal<string>('');
  viewingFile = signal(false);

  scorePercent = computed(() => {
    const d = this.detail();
    const s = this.score();
    if (!d || s === null) return 0;
    return Math.round((s / d.maxScore) * 100);
  });

  initFromDetail(detail: AssignmentSubmissionDetail): void {
    this.score.set(detail.currentScore ?? null);
    this.note.set(detail.currentNote ?? '');
  }

  reset(): void {
    this.score.set(null);
    this.note.set('');
  }

  onClose(): void {
    this.reset();
    this.close.emit();
  }

  onSubmit(): void {
    const d = this.detail();
    const s = this.score();
    if (!d || s === null) return;
    this.submitGrade.emit({
      submissionId: d.submissionId,
      score: s,
      note: this.note().trim() || null,
    });
  }

  scoreClass(): string {
    const pct = this.scorePercent();
    if (pct >= 80) return 'text-mint';
    if (pct >= 60) return 'text-star';
    return 'text-coral';
  }

  viewFile(): void {
    const fileUrl = this.detail()?.fileUrl;
    if (!fileUrl) return;

    this.viewingFile.set(true);
    this.storageSvc.getDownloadUrl(fileUrl).subscribe({
      next: (url) => {
        this.viewingFile.set(false);
        window.open(url, '_blank');
      },
      error: () => {
        this.viewingFile.set(false);
        this.toast.error('حدث خطأ أثناء فتح الملف');
      },
    });
  }
}
