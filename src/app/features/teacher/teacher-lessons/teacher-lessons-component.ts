import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { LessonsToolbarComponent } from './components/lessons-toolbar-component/lessons-toolbar-component';
import { LessonsTableComponent } from './components/lessons-table-component/lessons-table-component';
import { DeleteModalComponent } from './components/delete-modal-component/delete-modal-component';
import { TeacherLessonsService } from '../../../core/Services/Teacherlessons.service';
import { DeleteModalState, TeacherLesson } from '../../../core/Models/Teacher/Teacherlesson.model';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-teacher-lessons',
  imports: [DecimalPipe, LessonsToolbarComponent, LessonsTableComponent, DeleteModalComponent],
  templateUrl: './teacher-lessons-component.html',
})
export class TeacherLessonsComponent implements OnInit {
  private readonly service = inject(TeacherLessonsService);

  // Use the service's signal directly instead of converting Observable via toSignal
  readonly allLessons = this.service.lessons;

  // Reactive State Signals
  readonly searchQuery = signal<string>('');
  readonly statusFilter = signal<string>('all');
  readonly modal = signal<DeleteModalState>({ open: false, lessonId: null, lessonName: '' });

  // Computed Values (Automatically derive filters and lengths elegantly)
  readonly totalCount = computed(() => this.allLessons().length);

  readonly filteredLessons = computed(() => {
    // Reading these signals sets up an implicit dependency track
    const query = this.searchQuery();
    const filter = this.statusFilter();
    // Also re-runs if the underlying lessons signal updates
    this.allLessons();

    return this.service.filter(query, filter);
  });

  ngOnInit(): void {
    this.service.loadAll().subscribe();
  }

  onSearch(q: string): void {
    this.searchQuery.set(q);
  }

  onStatusChange(s: string): void {
    this.statusFilter.set(s);
  }

  onToggle(id: number): void {
    this.service.toggleStatus(id);
  }

  onDeleteRequest(lesson: TeacherLesson): void {
    this.modal.set({ open: true, lessonId: lesson.id, lessonName: lesson.name });
  }

  onDeleteConfirm(): void {
    const currentModal = this.modal();
    if (currentModal.lessonId === null) return;

    this.service.deleteLesson(currentModal.lessonId).subscribe({
      next: () => this.closeModal(),
      error: () => this.closeModal(),
    });
  }

  closeModal(): void {
    this.modal.set({ open: false, lessonId: null, lessonName: '' });
  }
}
