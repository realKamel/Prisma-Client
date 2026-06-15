import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from "@angular/router";

// Feature Tabs/Subcomponent Imports
import { AssignmentTab } from './Components/assignment-tab/assignment-tab';
import { SectionSidebar } from './Components/section-sidebar/section-sidebar';
import { QuizTab } from './Components/quiz-tab/quiz-tab';
import { AboutTab } from './Components/about-tab/about-tab';
import { VideoPlayer } from './Components/video-player/video-player';
import { MaterialsTab } from './Components/materials-tab/materials-tab';
import { environment } from '../../../../../environments/environment';
import { LessonService } from '../../../../core/Services/lesson.service';

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
  lessonDetails = signal<any>(null);
  breadcrumbs: Breadcrumb[] = [];
  
  tabs = [
    { id: 'about', label: 'عن الفصل' },
    { id: 'materials', label: 'المواد التعليمية' },
    { id: 'quiz', label: 'اختبر نفسك' },
    { id: 'assignment', label: 'الواجب المنزلي' }
  ];

  constructor(private lessonService: LessonService) {}

  ngOnInit(): void {
    this.lessonService.getLessonPlayerDetails(this.id).subscribe({
      next: (lesson) => {
          this.lessonDetails.set(lesson.data);

          this.breadcrumbs = [
            { label: 'الرئيسية', url: '/home' },
            { label: 'مكتبة الدروس', url: '/lessons' },
            { label: lesson.data.parentTitle},
            { label: lesson.data.title }
          ];
      },
      error: (err) => console.error('Failed:', err)
    });

    // Check configuration parameters map query parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('quiz') === 'done') {
      this.activeTab = 'quiz';
    }
  }

  setTab(tabName: string): void {
    this.activeTab = tabName;
  }
}