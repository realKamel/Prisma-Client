import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { LessonsHeaderComponent } from './components/lessons-header/lessons-header.component';
import { LessonsToolbarComponent } from './components/lessons-toolbar/lessons-toolbar.component';
import { LessonsTableComponent } from './components/lessons-table/lessons-table.component';
import { DeleteLessonModalComponent } from './components/delete-lesson-modal/delete-lesson-modal.component';
import { LessonToastComponent } from './components/lesson-toast/lesson-toast.component';
import { AssistantLessonsService } from '../../../core/Services/assistantlesson.service';
import { AssistantLessonDto } from '../../../core/Models/Assistant/assistant-lesson.model';

@Component({
  selector: 'app-lessons-page',

  imports: [
    LessonsHeaderComponent,
    LessonsToolbarComponent,
    LessonsTableComponent,
    DeleteLessonModalComponent,
    LessonToastComponent,
  ],
  templateUrl: './lessons-page.component.html',
})
export class LessonsPageComponent implements OnInit {
  private readonly lessonsService = inject(AssistantLessonsService);

  // Use the service's signal directly instead of converting Observable via toSignal
  private readonly lessons = this.lessonsService.lessons;

  readonly searchQuery = signal('');
  readonly deleteTarget = signal<AssistantLessonDto | null>(null);
  readonly toast = signal<{ message: string; visible: boolean }>({ message: '', visible: false });

  readonly filteredLessons = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const all = this.lessons();
    if (!query) return all;
    return all.filter((lesson) => lesson.title.toLowerCase().includes(query));
  });

  readonly totalCount = computed(() => this.lessons().length);
  readonly activeCount = computed(() => this.lessons().filter((l) => l.status === 'active').length);
  readonly draftedCount = computed(
    () => this.lessons().filter((l) => l.status === 'drafted').length,
  );
  readonly hiddenCount = computed(() => this.lessons().filter((l) => l.status === 'hidden').length);

  ngOnInit(): void {
    this.lessonsService.loadAll().subscribe();
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  onAddLesson(): void {
    // TODO: route to the lesson editor (new lesson) once this page is wired into the router.
  }

  onUploadMaterials(): void {
    // TODO: route to the lesson-upload feature.
  }

  onEdit(id: number): void {
    // TODO: route to the lesson editor with this lesson's id.
  }

  onToggleStatus(lesson: AssistantLessonDto): void {
    if (lesson.status === 'drafted') return;
    this.lessonsService.toggleStatus(lesson.id);
  }

  onRequestDelete(lesson: AssistantLessonDto): void {
    this.deleteTarget.set(lesson);
  }

  onCancelDelete(): void {
    this.deleteTarget.set(null);
  }

  onConfirmDelete(): void {
    const lesson = this.deleteTarget();
    if (!lesson) return;

    this.lessonsService.deleteLesson(lesson.id).subscribe({
      next: () => {
        this.deleteTarget.set(null);
        this.showToast(`تم حذف "${lesson.title}"`);
      },
      error: () => {
        this.deleteTarget.set(null);
        this.showToast('حدث خطأ أثناء الحذف، حاول مرة أخرى');
      },
    });
  }

  private showToast(message: string): void {
    this.toast.set({ message, visible: true });
    setTimeout(() => this.toast.set({ message, visible: false }), 2400);
  }
}
