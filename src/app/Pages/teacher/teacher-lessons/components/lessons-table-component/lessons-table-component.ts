import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TeacherLesson } from '../../../models/Teacherlesson.model';

@Component({
  selector: 'app-lessons-table',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './lessons-table-component.html',
})
export class LessonsTableComponent {
  @Input() lessons: TeacherLesson[] = [];
  @Output() toggleStatus = new EventEmitter<number>();
  @Output() deleteLesson = new EventEmitter<TeacherLesson>();

  readonly statusLabels: Record<string, string> = {
    active: 'نشط',
    hidden: 'مخفي',
    draft:  'مسودة',
  };

  readonly statusDotColor: Record<string, string> = {
    active: 'bg-[var(--mint)]',
    hidden: 'bg-[var(--muted)]',
    draft:  'bg-[var(--star)]',
  };

  readonly statusTextColor: Record<string, string> = {
    active: 'text-[var(--mint)]',
    hidden: 'text-[var(--muted)]',
    draft:  'text-[var(--star)]',
  };

  readonly statusBg: Record<string, string> = {
    active: 'bg-[rgba(78,203,141,.14)]  border-[rgba(78,203,141,.28)]',
    hidden: 'bg-[rgba(145,144,168,.12)] border-[rgba(145,144,168,.24)]',
    draft:  'bg-[rgba(247,201,72,.12)]  border-[rgba(247,201,72,.28)]',
  };

  toAr(n: number): string {
    return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
  }

  toggleLabel(lesson: TeacherLesson): string {
    return lesson.status === 'hidden' ? 'إظهار' : 'إخفاء';
  }

  toggleIcon(lesson: TeacherLesson): string {
    return lesson.status === 'hidden' ? 'bi-eye' : 'bi-eye-slash';
  }
}