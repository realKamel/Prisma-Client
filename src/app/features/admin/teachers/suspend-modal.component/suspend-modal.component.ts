import { Component, computed, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { Teacher } from '../../../../core/Models/Admin/teachers-admin.types';

export type SuspendAction = 'suspend' | 'reject';

@Component({
  selector: 'app-suspend-modal',
  imports: [FormsModule, NgmMotionDirective],
  templateUrl: './suspend-modal.component.html',
})
export class SuspendModalComponent {
  public readonly open = input(false);
  public readonly teacher = input<Teacher | null>(null);
  public readonly closed = output<void>();
  public readonly confirmed = output<{
    teacher: Teacher;
    action: SuspendAction;
    reason: string;
  }>();

  protected readonly reason = signal('');

  protected readonly action = computed<SuspendAction>(() =>
    this.teacher()?.status === 'active' ? 'suspend' : 'reject',
  );

  protected readonly title = computed(() =>
    this.action() === 'suspend' ? 'إيقاف المعلم' : 'رفض المعلم',
  );

  protected readonly subtitle = computed(() => {
    const teacher = this.teacher();
    if (!teacher) return '';
    return this.action() === 'suspend'
      ? `هل أنت متأكد من إيقاف حساب ${teacher.name}؟ لن يستطيع الدخول حتى تُعيد التفعيل.`
      : `هل تريد رفض طلب انضمام ${teacher.name}؟ سيتم حذف الحساب نهائياً.`;
  });

  protected readonly confirmLabel = computed(() =>
    this.action() === 'suspend' ? 'تأكيد الإيقاف' : 'تأكيد الرفض',
  );

  constructor() {
    effect(() => {
      if (this.open()) {
        this.reason.set('');
      }
    });
  }

  protected close(): void {
    this.closed.emit();
  }

  protected confirm(): void {
    const teacher = this.teacher();
    if (!teacher) return;
    this.confirmed.emit({ teacher, action: this.action(), reason: this.reason() });
  }
}
