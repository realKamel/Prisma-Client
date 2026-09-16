import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { DeleteModalState, TeacherLesson } from '../../../core/Models/Teacher/Teacherlesson.model';
import { TeacherLessonsService } from '../../../core/Services/Teacherlessons.service';
import { DeleteModalComponent } from './components/delete-modal-component/delete-modal-component';
import { LessonsTableComponent } from './components/lessons-table-component/lessons-table-component';
import { LessonsToolbarComponent } from './components/lessons-toolbar-component/lessons-toolbar-component';

@Component({
  selector: 'app-teacher-lessons',
  imports: [
    DecimalPipe,
    LessonsToolbarComponent,
    LessonsTableComponent,
    DeleteModalComponent,
    NgmMotionDirective,
  ],
  templateUrl: './teacher-lessons-component.html',
})
export class TeacherLessonsComponent implements OnInit {
  private readonly service = inject(TeacherLessonsService);

  // Use the service's signal directly instead of converting Observable via toSignal
  protected readonly allLessons = this.service.lessons;

  // Reactive State Signals
  protected readonly searchQuery = signal<string>('');
  protected readonly statusFilter = signal<string>('all');
  protected readonly modal = signal<DeleteModalState>({
    open: false,
    lessonId: null,
    lessonName: '',
  });

  // Computed Values (Automatically derive filters and lengths elegantly)
  protected readonly totalCount = computed(() => this.allLessons().length);

  protected readonly filteredLessons = computed(() => {
    // Reading these signals sets up an implicit dependency track
    const query = this.searchQuery();
    const filter = this.statusFilter();
    // Also re-runs if the underlying lessons signal updates
    this.allLessons();

    return this.service.filter(query, filter);
  });

  public ngOnInit(): void {
    this.service.loadAll().subscribe();
  }

  protected onSearch(q: string): void {
    this.searchQuery.set(q);
  }

  protected onStatusChange(s: string): void {
    this.statusFilter.set(s);
  }

  protected onToggle(id: number): void {
    this.service.toggleStatus(id);
  }

  protected onDeleteRequest(lesson: TeacherLesson): void {
    this.modal.set({ open: true, lessonId: lesson.id, lessonName: lesson.name });
  }

  protected onDeleteConfirm(): void {
    const currentModal = this.modal();
    if (currentModal.lessonId === null) return;

    this.service.deleteLesson(currentModal.lessonId).subscribe({
      next: () => this.closeModal(),
      error: () => this.closeModal(),
    });
  }

  protected closeModal(): void {
    this.modal.set({ open: false, lessonId: null, lessonName: '' });
  }
}
