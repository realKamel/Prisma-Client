import { Component, input } from '@angular/core';

import { ActionType, LogEntry } from '../../../../../core/Models/Assistant/log.model';
import { toAr } from '../../../../../core/pipes/to-ar (1)';

const DETAIL_AR: Record<string, string> = {
  lesson: 'الدرس',
  lessonmaterial: 'محتوى الدرس',
  section: 'القسم',
  academicyearlesson: 'درس العام الدراسي',
  enrollment: 'التسجيل',
  payment: 'الدفع',
  assignment: 'الواجب',
  assignmentsubmission: 'تسليم الواجب',
  quizattempt: 'الكويز',
  student: 'الطالب',
  auditlog: 'السجل',
};

const SUB_AR: Record<string, string> = {
  insert: 'إضافة',
  create: 'إضافة',
  update: 'تعديل',
  delete: 'حذف',
  select: 'اطلاع',
};

@Component({
  selector: 'app-log-table',

  imports: [],
  templateUrl: './log-table.component.html',
})
export class LogTableComponent {
  readonly logs = input<LogEntry[]>([]);

  typeLabel(type: ActionType): string {
    const labels: Record<ActionType, string> = {
      grant: 'منح',
      revoke: 'إلغاء',
      view: 'عرض',
      search: 'بحث',
    };
    return labels[type];
  }

  pillClass(type: ActionType): string {
    const classes: Record<ActionType, string> = {
      grant: 'bg-[rgba(78,203,141,0.14)] text-[var(--mint)]',
      revoke: 'bg-[rgba(240,106,106,0.14)] text-[var(--coral)]',
      view: 'bg-[rgba(var(--accent-rgb),0.14)] text-[var(--purple-lt)]',
      search: 'bg-[rgba(247,201,72,0.14)] text-[var(--star)]',
    };
    return classes[type];
  }

  pillIcon(type: ActionType): string {
    const icons: Record<ActionType, string> = {
      grant: 'bi-check2-circle',
      revoke: 'bi-x-circle',
      view: 'bi-eye',
      search: 'bi-search',
    };
    return icons[type];
  }

  detailLabel(detail: string): string {
    return DETAIL_AR[detail.toLowerCase()] ?? detail;
  }

  subLabel(sub: string): string {
    return SUB_AR[sub.toLowerCase()] ?? sub;
  }

  arTime(time: string): string {
    return toAr(time);
  }

  arDate(date: string): string {
    return toAr(date);
  }
}
