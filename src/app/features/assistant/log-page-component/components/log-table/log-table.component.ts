import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import {
  bootstrapCheck2Circle,
  bootstrapCheckLg,
  bootstrapEye,
  bootstrapSearch,
  bootstrapXCircle,
  bootstrapXLg,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ActionType, LogEntry } from '../../../../../core/Models/Assistant/log.model';
import { RelativeTimePipe } from '../../../../../shared/pipes/relative-time.pipe';

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
  imports: [DatePipe, NgIcon, RelativeTimePipe],
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
  public readonly logs = input<LogEntry[]>([]);

  protected typeLabel(type: ActionType): string {
    const labels: Record<ActionType, string> = {
      grant: 'منح',
      revoke: 'إلغاء',
      view: 'عرض',
      search: 'بحث',
    };
    return labels[type];
  }

  protected pillClass(type: ActionType): string {
    const classes: Record<ActionType, string> = {
      grant: 'bg-[rgba(78,203,141,0.14)] text-mint',
      revoke: 'bg-[rgba(240,106,106,0.14)] text-coral',
      view: 'bg-[rgba(var(--color-primary-rgb),0.14)] text-primary-light',
      search: 'bg-[rgba(247,201,72,0.14)] text-star',
    };
    return classes[type];
  }

  protected pillIcon(type: ActionType): string {
    const icons: Record<ActionType, string> = {
      grant: 'bootstrapCheck2Circle',
      revoke: 'bootstrapXCircle',
      view: 'bootstrapEye',
      search: 'bootstrapSearch',
    };
    return icons[type];
  }

  protected detailLabel(detail: string): string {
    return DETAIL_AR[detail.toLowerCase()] ?? detail;
  }

  protected subLabel(sub: string): string {
    return SUB_AR[sub.toLowerCase()] ?? sub;
  }
}
