import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from "@angular/router";
import { AssignmentTab } from './Components/assignment-tab/assignment-tab';
import { SectionSidebar } from './Components/section-sidebar/section-sidebar';
import { QuizTab } from './Components/quiz-tab/quiz-tab';
import { AboutTab } from './Components/about-tab/about-tab';
import { VideoPlayer } from './Components/video-player/video-player';
import { MaterialsTab } from './Components/materials-tab/materials-tab';
import { LessonService } from '../../../../core/Services/lesson.service';
import { LessonPlayerResult, Material, Section } from '../../../../core/Models/Lesson/Lesson-Player';
import { toast } from 'ngx-sonner';
interface Breadcrumb {
  label: string;
  url?: string | any[];
}

@Component({
  selector: 'app-lesson-player',
  standalone: true,
  imports: [
    CommonModule,
    VideoPlayer,
    AboutTab,
    AssignmentTab,
    QuizTab,
    SectionSidebar,
    MaterialsTab,
    RouterLink
  ],
  templateUrl: './lesson-player.html'
})
export class LessonPlayer implements OnInit {
  @Input() id!: string;

  activeTab: string = 'about';
  activeSection = signal<Section | null>(null);
  lesson: LessonPlayerResult | null = null;
  materials: Material[] = [];
  breadcrumbs: Breadcrumb[] = [];

  tabs = [
    { id: 'about', label: 'عن الفصل' },
    { id: 'materials', label: 'المواد التعليمية' },
    { id: 'quiz', label: 'اختبر نفسك' },
    { id: 'assignment', label: 'الواجب المنزلي' }
  ];

  private lessonService = inject(LessonService);

  ngOnInit(): void {
    this.lessonService.getLessonPlayerDetails(this.id).subscribe({
      next: (res) => {
        this.lesson = res.data;

        // merge assignment contentURL into materials
        this.materials = [...(this.lesson?.materials ?? [])];
        if (this.lesson?.assignment?.contentURL) {
          this.materials.push({
            title: 'واجب الدرس',
            type: 'pdf',
            downloadUrl: this.lesson.assignment.contentURL
          });
        }

        this.breadcrumbs = [
          { label: 'الرئيسية', url: '/home' },
          { label: 'مكتبة الدروس', url: '/lessons' },
          { label: this.lesson?.title ?? '' }
        ];

        const current = this.lesson?.sections?.find(s => !s.isCompleted) 
          ?? this.lesson?.sections?.[0] 
          ?? null;
        this.activeSection.set(current);
      },
      error: (err) => console.error('Failed:', err)
    });

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('quiz') === 'done') {
      this.activeTab = 'quiz';
    }
  }

  onSectionSelected(item: Section): void {
    const current = this.activeSection();

    if (item.isCompleted || item.id === current?.id) {
      this.activeSection.set(item);
      return;
    }

    if (current && item.id > current.id) {
      toast.warning('أكمل المحاضرة الحالية أولاً');
      return;
    }

    this.activeSection.set(item);
  }

  setTab(tabName: string): void {
    this.activeTab = tabName;
  }
}