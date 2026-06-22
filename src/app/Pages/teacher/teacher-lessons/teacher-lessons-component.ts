import { ChangeDetectorRef, Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { LessonsToolbarComponent } from './components/lessons-toolbar-component/lessons-toolbar-component';
import { LessonsTableComponent } from './components/lessons-table-component/lessons-table-component';
import { DeleteModalComponent } from './components/delete-modal-component/delete-modal-component';
import { TeacherLessonsService } from '../../../core/Services/Teacherlessons.service';
import { DeleteModalState, TeacherLesson } from '../../../core/Models/Teacher/Teacherlesson.model';



@Component({
  selector: 'app-teacher-lessons',
  standalone: true,
  imports: [
    CommonModule,
    LessonsToolbarComponent,
    LessonsTableComponent,
    DeleteModalComponent,
  ],
  templateUrl: './teacher-lessons-component.html',
})
export class TeacherLessonsComponent implements OnInit, OnDestroy {
  private service = inject(TeacherLessonsService);
  private cdr     = inject(ChangeDetectorRef);
  private sub!: Subscription;

  filteredLessons: TeacherLesson[] = [];
  totalCount = 0;

  searchQuery  = '';
  statusFilter = 'all';

  modal: DeleteModalState = { open: false, lessonId: null, lessonName: '' };

  ngOnInit(): void {
    this.service.loadAll().subscribe()
    this.sub = this.service.lessons$.subscribe(lessons => {
      this.totalCount = lessons.length;
      this.applyFilter();
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onSearch(q: string): void {
    this.searchQuery = q;
    this.applyFilter();
  }

  onStatusChange(s: string): void {
    this.statusFilter = s;
    this.applyFilter();
  }

  private applyFilter(): void {
    this.filteredLessons = this.service.filter(this.searchQuery, this.statusFilter);
  }

  onToggle(id: number): void {
    this.service.toggleStatus(id);
  }

  onDeleteRequest(lesson: TeacherLesson): void {
    this.modal = { open: true, lessonId: lesson.id, lessonName: lesson.name };
  }

  onDeleteConfirm(): void {
    if (this.modal.lessonId !== null) {
      this.service.delete(this.modal.lessonId);
    }
    this.closeModal();
  }

  closeModal(): void {
    this.modal = { open: false, lessonId: null, lessonName: '' };
  }

  toAr(n: number): string {
    return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
  }


}