import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from "@angular/router";

// Feature Tabs/Subcomponent Imports
import { AssignmentTab } from './Components/assignment-tab/assignment-tab';
import { SectionSidebar } from './Components/section-sidebar/section-sidebar';
import { QuizTab } from './Components/quiz-tab/quiz-tab';
import { AboutTab } from './Components/about-tab/about-tab';
import { VideoPlayer } from './Components/video-player/video-player';
import { MaterialsTab } from './Components/materials-tab/materials-tab';

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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('assets/data/lesson-details.json').subscribe({
      next: (lessons) => {
        const match = lessons.find(l => String(l.id) === String(this.id));

        if (match) {
          // 3. قم بتحديث الـ Signal باستخدام (.set)
          this.lessonDetails.set(match);

          this.breadcrumbs = [
            { label: 'الرئيسية', url: '/home' },
            { label: 'مكتبة الدروس', url: '/lessons' },
            { label: match.parentTitle, url: ['/lessons', match.parentId] },
            { label: match.title }
          ];
        }
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