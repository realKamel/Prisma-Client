import { Component, inject, input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LessonService } from '../../../../../core/Services/lesson.service';
import { toast } from 'ngx-sonner';
import {
  LessonPlayerResult,
  Material,
  Section,
} from '../../../../../core/Models/Lesson/Lesson-Player';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapChevronLeft } from '@ng-icons/bootstrap-icons';
import { AboutTab } from './Components/about-tab/about-tab';
import { AssignmentTab } from './Components/assignment-tab/assignment-tab';
import { MaterialsTab } from './Components/materials-tab/materials-tab';
import { QuizTab } from './Components/quiz-tab/quiz-tab';
import { SectionSidebar } from './Components/section-sidebar/section-sidebar';
import { VidstackPlayer } from './Components/vidstack-player/vidstack-player';

interface Breadcrumb {
  label: string;
  url?: string | unknown[];
}

@Component({
  selector: 'app-lesson-player',
  imports: [
    AboutTab,
    AssignmentTab,
    QuizTab,
    SectionSidebar,
    MaterialsTab,
    RouterLink,
    VidstackPlayer,
    NgIcon,
  ],
  templateUrl: './lesson-player.html',
  viewProviders: [
    provideIcons({
      bootstrapChevronLeft,
    }),
  ],
})
export class LessonPlayer implements OnInit {
  private lessonService = inject(LessonService);

  // Input Signal
  readonly id = input<string>();

  // Core State Signals
  readonly activeTab = signal<string>('about');
  readonly activeSection = signal<Section | null>(null);
  readonly lesson = signal<LessonPlayerResult>({} as LessonPlayerResult);
  readonly materials = signal<Material[]>([]);
  readonly breadcrumbs = signal<Breadcrumb[]>([]);

  readonly tabs = [
    { id: 'about', label: 'عن الفصل' },
    { id: 'materials', label: 'المواد التعليمية' },
    { id: 'quiz', label: 'اختبر نفسك' },
    { id: 'assignment', label: 'الواجب المنزلي' },
  ];

  ngOnInit(): void {
    this.lessonService.getLessonPlayerDetails(this.id() ?? '').subscribe({
      next: (res) => {
        const currentLesson = res.data;
        this.lesson.set(currentLesson!);

        // Compute materials including optional assignment PDF
        const extractedMaterials: Material[] = [...(currentLesson?.materials ?? [])];
        if (currentLesson?.assignment?.contentURL) {
          extractedMaterials.push({
            title: 'واجب الدرس',
            type: 'pdf',
            downloadUrl: currentLesson.assignment.contentURL,
          });
        }
        this.materials.set(extractedMaterials);

        // Build navigation hierarchy
        this.breadcrumbs.set([
          { label: 'الرئيسية', url: '/home' },
          { label: 'مكتبة الدروس', url: '/lessons' },
          { label: currentLesson?.title ?? '' },
        ]);

        // Auto-select first uncompleted section or fall back to index 0
        const sections = currentLesson?.sections ?? [];
        const current = sections.find((s) => !s.isCompleted) ?? sections[0] ?? null;
        this.activeSection.set(current);
      },
      error: (err) => console.error('Failed:', err),
    });

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('quiz') === 'done') {
      this.activeTab.set('quiz');
    }
  }

  onSectionCompleted(): void {
    const active = this.activeSection();
    const currentLesson = this.lesson();
    if (!active || !currentLesson) return;

    // Mutate internal structural flag safely inside reference sequence
    const section = currentLesson.sections.find((s) => s.id === active.id);
    if (section) {
      section.isCompleted = true;
    }
    this.activeSection.set({ ...active, isCompleted: true });
  }

  onSectionSelected(item: Section): void {
    const sections = this.lesson()?.sections ?? [];
    const currentIndex = sections.findIndex((s) => s.id === this.activeSection()?.id);
    const itemIndex = sections.findIndex((s) => s.id === item.id);

    if (item.isCompleted) {
      this.activeSection.set(item);
      return;
    }

    if (item.id === this.activeSection()?.id) {
      return;
    }

    const currentSection = sections[currentIndex];
    if (itemIndex > currentIndex && !currentSection?.isCompleted) {
      toast.warning('أكمل المحاضرة الحالية أولاً');
      return;
    }

    this.activeSection.set(item);
  }

  setTab(tabName: string): void {
    this.activeTab.set(tabName);
  }
}
