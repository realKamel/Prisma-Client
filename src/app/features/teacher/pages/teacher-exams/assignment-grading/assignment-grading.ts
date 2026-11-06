import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../../../core/services/toast/toast-service';
import { studentInitials } from '../../../../../shared/pipes/arabic-numerals/arabic-numerals';
import {
  AssignmentSubmissionDetail,
  AssignmentSubmissionListItem,
} from '../../../models/assignment-model';
import { AssignmentGradeSubmitEvent } from '../../../models/teacher-exams-model';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-assignment-grading',
  imports: [FormsModule, DatePipe, DecimalPipe],
  templateUrl: './assignment-grading.html',
})
export class AssignmentGradingComponent {
  private readonly storageSvc = inject(StorageService);
  private readonly toast = inject(ToastService);

  protected readonly initials = studentInitials;

  // ── inputs ──
  public readonly items = input.required<AssignmentSubmissionListItem[]>(); // جديد
  public readonly selectedId = input<number | null>(null);                  // جديد
  public readonly detail = input<AssignmentSubmissionDetail | null>(null);
  public readonly loading = input<boolean>(false);
  public readonly saving = input<boolean>(false);

  // ── outputs ──
  public readonly back = output<void>();                                    // بدل closeQuery
  public readonly selectStudent = output<AssignmentSubmissionListItem>();   // جديد
  public readonly submitGrade = output<AssignmentGradeSubmitEvent>();


  // ── local state: بيتحسب من جديد كل ما detail يتغير ──
  protected readonly score = linkedSignal<AssignmentSubmissionDetail | null, number | null>({
    source: this.detail,
    computation: (d) => d?.currentScore ?? null,
  });

  protected readonly note = linkedSignal<AssignmentSubmissionDetail | null, string>({
    source: this.detail,
    computation: (d) => d?.currentNote ?? '',
  });

  protected readonly viewingFile = signal(false);

  protected readonly scorePercent = computed(() => {
    const d = this.detail();
    const s = this.score();
    if (!d || s === null) return 0;
    return Math.round((s / d.maxScore) * 100);
  });

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
