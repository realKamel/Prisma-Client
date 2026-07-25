import { Component, inject, input } from '@angular/core';
import { ActionType, LogEntry } from '../../../../../core/Models/Assistant/log.model';
import { DatePipe, DecimalPipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapCheck2Circle,
  bootstrapXCircle,
  bootstrapEye,
  bootstrapSearch,
  bootstrapCheckLg,
  bootstrapXLg,
} from '@ng-icons/bootstrap-icons';

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
  imports: [DatePipe, NgIcon],
  templateUrl: './log-table.component.html',
  viewProviders: [
    provideIcons({
      bootstrapCheck2Circle,
      bootstrapXCircle,
      bootstrapEye,
      bootstrapSearch,
      bootstrapCheckLg,
      bootstrapXLg,
    }),
  ],
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
      grant: 'bootstrapCheck2Circle',
      revoke: 'bootstrapXCircle',
      view: 'bootstrapEye',
      search: 'bootstrapSearch',
    };
    return icons[type];
  }

  detailLabel(detail: string): string {
    return DETAIL_AR[detail.toLowerCase()] ?? detail;
  }

  subLabel(sub: string): string {
    return SUB_AR[sub.toLowerCase()] ?? sub;
  }
}
