import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Teacher } from '../../../../core/Models/Admin/teachers-admin.types';

export type SuspendAction = 'suspend' | 'reject';

@Component({
  selector: 'app-suspend-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './suspend-modal.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class SuspendModalComponent implements OnChanges {
  @Input() open = false;
  @Input() teacher: Teacher | null = null;

  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<{ teacher: Teacher; action: SuspendAction; reason: string }>();

  reason = '';

  get action(): SuspendAction {
    return this.teacher?.status === 'active' ? 'suspend' : 'reject';
  }

  get title(): string {
    return this.action === 'suspend' ? 'إيقاف المعلم' : 'رفض المعلم';
  }

  get subtitle(): string {
    if (!this.teacher) return '';
    return this.action === 'suspend'
      ? `هل أنت متأكد من إيقاف حساب ${this.teacher.name}؟ لن يستطيع الدخول حتى تُعيد التفعيل.`
      : `هل تريد رفض طلب انضمام ${this.teacher.name}؟ سيتم حذف الحساب نهائياً.`;
  }

  get confirmLabel(): string {
    return this.action === 'suspend' ? 'تأكيد الإيقاف' : 'تأكيد الرفض';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']?.currentValue === true) {
      this.reason = '';
    }
  }

  close(): void {
    this.closed.emit();
  }

  confirm(): void {
    if (!this.teacher) return;
    this.confirmed.emit({ teacher: this.teacher, action: this.action, reason: this.reason });
  }
}
