import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TeacherStudentsService } from '../../../../core/Services/teacher-students.service';
import { Student, ReportRequest } from '../../../../core/Models/Teacher/student.model';

@Component({
  selector: 'app-send-report',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './send-report.html',
})
export class SendReport implements OnInit {
  private service = inject(TeacherStudentsService);
  private cdr = inject(ChangeDetectorRef);

  students: Student[] = [];
  loading = true;
  filteredList: Student[] = [];
  searchQuery = '';
  selectedIds = new Set<number>();
  reportType: 'attendance' | 'grades' | 'progress' = 'attendance';
  dateFrom = '2026-05-01';
  dateTo = '2026-06-03';
  showSuccess = false;
  sending = false;

  readonly typeLabels: Record<string, string> = {
    attendance: 'تقرير حضور',
    grades: 'تقرير درجات',
    progress: 'تقرير تقدم عام',
  };

  readonly typeIncludes: Record<string, string[]> = {
    attendance: ['نسبة الحضور', 'عدد الجلسات الحاضرة', 'عدد الغيابات'],
    grades: ['متوسط درجات الكويزات', 'أعلى وأدنى درجة', 'المقارنة بمتوسط الفصل'],
    progress: ['نسبة الحضور', 'متوسط الدرجات', 'الدروس المكتملة', 'ملاحظات المعلمة'],
  };

  ngOnInit() {
    this.service.getStudentsMock().subscribe({
      next: (res) => {
        this.students = res;
        this.filteredList = [...res];
        this.loading = false;

        const studentId = new URLSearchParams(window.location.search).get('student');
        if (studentId) {
          const id = +studentId;
          if (this.students.find(s => s.id === id)) {
            this.selectedIds.add(id);
          }
        }
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  onSearch() {
    const q = this.searchQuery.trim().toLowerCase();
    this.filteredList = q ? this.students.filter(s => s.name.toLowerCase().includes(q)) : [...this.students];
  }

  toggleStudent(id: number) {
    if (this.selectedIds.has(id)) this.selectedIds.delete(id);
    else this.selectedIds.add(id);
  }

  get allSelected(): boolean {
    return this.filteredList.length > 0 && this.filteredList.every(s => this.selectedIds.has(s.id));
  }

  toggleSelectAll() {
    if (this.allSelected) {
      this.filteredList.forEach(s => this.selectedIds.delete(s.id));
    } else {
      this.filteredList.forEach(s => this.selectedIds.add(s.id));
    }
  }

  selectType(type: 'attendance' | 'grades' | 'progress') {
    this.reportType = type;
  }

  getInitials(name: string): string {
    const p = name.trim().split(' ');
    return p.length >= 2 ? p[0][0] + p[1][0] : p[0][0];
  }

  toAr(n: number): string {
    return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
  }

  get previewNameStr(): string {
    const names = [...this.selectedIds].slice(0, 2).map(id => {
      const s = this.students.find(x => x.id === id);
      return s ? s.name.split(' ')[0] : '';
    }).filter(Boolean);
    const more = this.selectedIds.size > 2 ? this.selectedIds.size - 2 : 0;
    return names.join('، ') + (more ? ` و${this.toAr(more)} آخرين` : '');
  }

  sendReport() {
    this.sending = true;
    this.cdr.detectChanges();
    const request: ReportRequest = {
      studentIds: [...this.selectedIds],
      reportType: this.reportType,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo
    };
    this.service.sendReportMock(request).subscribe({
      next: () => { this.sending = false; this.showSuccess = true; this.cdr.detectChanges(); },
      error: () => { this.sending = false; this.cdr.detectChanges(); }
    });
  }

  closeSuccess() {
    this.showSuccess = false;
    this.selectedIds.clear();
    this.onSearch();
    this.cdr.detectChanges();
  }
}
