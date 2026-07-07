import { ChangeDetectorRef, Component, inject, input, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AssignmentTab } from './Components/assignment-tab/assignment-tab';
import { SectionSidebar } from './Components/section-sidebar/section-sidebar';
import { QuizTab } from './Components/quiz-tab/quiz-tab';
import { AboutTab } from './Components/about-tab/about-tab';
import { VideoPlayer } from './Components/video-player/video-player';
import { MaterialsTab } from './Components/materials-tab/materials-tab';
import { LessonService } from '../../../../core/Services/lesson.service';
import {
  LessonPlayerResult,
  Material,
  Section,
} from '../../../../core/Models/Lesson/Lesson-Player';
import { toast } from 'ngx-sonner';
import { VidstackPlayer } from './Components/vidstack-player/vidstack-player';
interface Breadcrumb {
  label: string;
  url?: string | any[];
}

@Component({
  selector: 'app-lesson-player',
  standalone: true,
  imports: [
    CommonModule,
    // VideoPlayer,
    AboutTab,
    AssignmentTab,
    QuizTab,
    SectionSidebar,
    MaterialsTab,
    RouterLink,
    VidstackPlayer,
  ],
  templateUrl: './lesson-player.html',
})
export class LessonPlayer implements OnInit {
  public readonly id = input<string>();
  public readonly activeTab = signal<string>('about');
  public readonly activeSection = signal<Section | null>(null);
  lesson: LessonPlayerResult | null = null;
  materials: Material[] = [];
  breadcrumbs: Breadcrumb[] = [];

  public readonly tabs = [
    { id: 'about', label: 'عن الفصل' },
    { id: 'materials', label: 'المواد التعليمية' },
    { id: 'quiz', label: 'اختبر نفسك' },
    { id: 'assignment', label: 'الواجب المنزلي' },
  ];

  private lessonService = inject(LessonService);
  private cdr = inject(ChangeDetectorRef);
  ngOnInit(): void {
    this.lessonService.getLessonPlayerDetails(this.id() ?? '').subscribe({
      next: (res) => {
        this.lesson = res.data;

        this.materials = [...(this.lesson?.materials ?? [])];
        if (this.lesson?.assignment?.contentURL) {
          this.materials.push({
            title: 'واجب الدرس',
            type: 'pdf',
            downloadUrl: this.lesson.assignment.contentURL,
          });
        }

        this.breadcrumbs = [
          { label: 'الرئيسية', url: '/home' },
          { label: 'مكتبة الدروس', url: '/lessons' },
          { label: this.lesson?.title ?? '' },
        ];

        const current =
          this.lesson?.sections?.find((s) => !s.isCompleted) ?? this.lesson?.sections?.[0] ?? null;
        this.activeSection.set(current);
        this.cdr.detectChanges();
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
    if (!active) return;

    const section = this.lesson!.sections.find(s => s.id === active.id);
    if (section) {
      section.isCompleted = true;
    }
    this.activeSection.set({ ...active, isCompleted: true });
    this.cdr.detectChanges();
  }
  onSectionSelected(item: Section): void {
    const sections = this.lesson?.sections ?? [];
    const currentIndex = sections.findIndex(s => s.id === this.activeSection()?.id);
    const itemIndex = sections.findIndex(s => s.id === item.id);

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
