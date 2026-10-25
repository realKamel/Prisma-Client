import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-delete-exam',

  imports: [],
  template: `
    @if (show()) {
      <div
        class="fixed inset-0 z-200 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        (click)="cancel.emit()"
      >
        <div
          class="w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-[0_24px_64px_rgba(0,0,0,0.32)]"
          (click)="$event.stopPropagation()"
        >
          <div class="mb-2 text-base font-black text-ink">تأكيد الحذف</div>
          <p class="mb-5 text-[13px] font-semibold leading-relaxed text-muted">
            هل أنت متأكد إنك عايز تحذف اختبار "<span class="font-bold text-ink">{{
              examTitle()
            }}</span
            >"؟ العملية دي مش هترجع.
          </p>
          <div class="flex justify-end gap-3">
            <button
              type="button"
              (click)="cancel.emit()"
              class="rounded-full border border-border px-5 py-2 text-sm font-bold text-muted transition-colors hover:border-border-focus hover:text-ink"
            >
              إلغاء
            </button>
            <button
              type="button"
              (click)="confirm.emit()"
              class="rounded-full bg-coral px-5 py-2 text-sm font-bold text-white shadow-[0_4px_16px_rgba(240,106,106,0.28)] transition-transform hover:scale-[1.02]"
            >
              حذف الاختبار
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class DeleteExamComponent {
  readonly show = input(false);
  readonly examTitle = input('');
  readonly cancel = output<void>();
  readonly confirm = output<void>();
}
