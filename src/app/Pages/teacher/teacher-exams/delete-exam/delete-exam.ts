import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delete-exam',
  standalone: true,
  imports: [CommonModule],
  template: `
@if (show) {
<div class="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
  (click)="cancel.emit()">
  <div class="w-full max-w-sm overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.32)]"
    (click)="$event.stopPropagation()">
    <div class="mb-2 text-base font-black text-[var(--ink)]">تأكيد الحذف</div>
    <p class="mb-5 text-[13px] font-semibold leading-relaxed text-[var(--muted)]">
      هل أنت متأكد إنك عايز تحذف اختبار "<span class="font-bold text-[var(--ink)]">{{ examTitle }}</span>"؟ العملية دي مش هترجع.
    </p>
    <div class="flex justify-end gap-3">
      <button type="button" (click)="cancel.emit()"
        class="rounded-full border border-[var(--border)] px-5 py-2 text-sm font-bold text-[var(--muted)] transition-colors hover:border-[var(--border-focus)] hover:text-[var(--ink)]">
        إلغاء
      </button>
      <button type="button" (click)="confirm.emit()"
        class="rounded-full bg-[var(--coral)] px-5 py-2 text-sm font-bold text-white shadow-[0_4px_16px_rgba(240,106,106,0.28)] transition-transform hover:scale-[1.02]">
        حذف الاختبار
      </button>
    </div>
  </div>
</div>
}
  `,
})
export class DeleteExamComponent {
  @Input() show = false;
  @Input() examTitle = '';
  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
}