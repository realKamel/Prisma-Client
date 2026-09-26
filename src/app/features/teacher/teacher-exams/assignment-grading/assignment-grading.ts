import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AssignmentSubmissionDetail,
  AssignmentSubmissionListItem,
} from '../../../../core/Models/Teacher/assignment-model';
import { AssignmentGradeSubmitEvent } from '../../../../core/Models/Teacher/teacher-exams-model';
import { studentInitials } from '../../../../core/pipes/arabic-numerals/arabic-numerals';
import { StorageService } from '../../../../core/Services/storage-service';
import { ToastService } from '../../../../core/Services/toast-service';

@Component({
  selector: 'app-assignment-grading',
  imports: [FormsModule, DatePipe, DecimalPipe],
  templateUrl: './assignment-grading.html',
})
export class AssignmentGradingComponent {
  private readonly storageSvc = inject(StorageService);
  private readonly toast = inject(ToastService);

  protected readonly initials = studentInitials;

  public readonly show = input.required<boolean>();
  public readonly item = input<AssignmentSubmissionListItem | null>(null);
  public readonly detail = input<AssignmentSubmissionDetail | null>(null);
  public readonly loading = input<boolean>(false);
  public readonly saving = input<boolean>(false);
  public readonly closeQuery = output<void>();
  public readonly submitGrade = output<AssignmentGradeSubmitEvent>();

  protected readonly score = signal<number | null>(null);
  protected readonly note = signal<string>('');
  protected readonly viewingFile = signal(false);

  protected readonly scorePercent = computed(() => {
    const d = this.detail();
    const s = this.score();
    if (!d || s === null) return 0;
    return Math.round((s / d.maxScore) * 100);
  });

  public initFromDetail(detail: AssignmentSubmissionDetail): void {
    this.score.set(detail.currentScore ?? null);
    this.note.set(detail.currentNote ?? '');
  }

  protected reset(): void {
    this.score.set(null);
    this.note.set('');
  }

  protected onClose(): void {
    this.reset();
    this.closeQuery.emit();
  }

  protected onSubmit(): void {
    const d = this.detail();
    const s = this.score();
    if (!d || s === null) return;
    this.submitGrade.emit({
      submissionId: d.submissionId,
      score: s,
      note: this.note().trim() || null,
    });
  }

  protected scoreClass(): string {
    const pct = this.scorePercent();
    if (pct >= 80) return 'text-mint';
    if (pct >= 60) return 'text-star';
    return 'text-coral';
  }

  protected viewFile(): void {
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
