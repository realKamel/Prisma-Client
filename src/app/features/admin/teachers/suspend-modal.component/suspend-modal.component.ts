import { Component, computed, effect, input, output, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Teacher } from '../../../../core/Models/Admin/teachers-admin.types';

export type SuspendAction = 'suspend' | 'reject';

@Component({
  selector: 'app-suspend-modal',
  imports: [FormsModule],
  templateUrl: './suspend-modal.component.html',
})
export class SuspendModalComponent {
  readonly open = input(false);
  readonly teacher = input<Teacher | null>(null);

  readonly closed = output<void>();
  readonly confirmed = output<{
    teacher: Teacher;
    action: SuspendAction;
    reason: string;
  }>();

  readonly reason = signal('');

  readonly action = computed<SuspendAction>(() =>
    this.teacher()?.status === 'active' ? 'suspend' : 'reject',
  );

  readonly title = computed(() => (this.action() === 'suspend' ? 'إيقاف المعلم' : 'رفض المعلم'));

  readonly subtitle = computed(() => {
    const teacher = this.teacher();
    if (!teacher) return '';
    return this.action() === 'suspend'
      ? `هل أنت متأكد من إيقاف حساب ${teacher.name}؟ لن يستطيع الدخول حتى تُعيد التفعيل.`
      : `هل تريد رفض طلب انضمام ${teacher.name}؟ سيتم حذف الحساب نهائياً.`;
  });

  readonly confirmLabel = computed(() =>
    this.action() === 'suspend' ? 'تأكيد الإيقاف' : 'تأكيد الرفض',
  );

  constructor() {
    effect(() => {
      if (this.open()) {
        this.reason.set('');
      }
    });
  }

  close(): void {
    this.closed.emit();
  }

  confirm(): void {
    const teacher = this.teacher();
    if (!teacher) return;
    this.confirmed.emit({ teacher, action: this.action(), reason: this.reason() });
  }
}
