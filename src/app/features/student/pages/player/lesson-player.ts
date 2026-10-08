import { Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  bootstrapChevronLeft,
  bootstrapLockFill,
  bootstrapTrophyFill,
  bootstrapXLg,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { toast } from 'ngx-sonner';
import {
  lessonCelebration,
  prefersReducedMotion,
} from '../../../../core/animations/Lesson-celebration.animations';
import {
  pageEntranceInitial,
  sectionRevealEnter,
  sectionRevealTransition,
} from '../../../../core/animations/motion.animations';
import { Breadcrumb } from '../../../../core/Models/Common/navigation.model';
import {
  AssignmentSubmission,
  LessonPlayerResult,
  Material,
  Section,
} from '../../../../core/Models/Lesson/Lesson-Player';
import { EnrollmentService } from '../../../../core/Services/enrollment-service/enrollment.service';
import { LessonService } from '../../../../core/Services/lesson.service';
import { AboutTabComponent } from './components/about-tab/about-tab';
import { AssignmentTab } from './components/assignment-tab/assignment-tab';
import { MaterialsTabComponent } from './components/materials-tab/materials-tab';
import { QuizTab } from './components/quiz-tab/quiz-tab';
import { SectionSidebarComponent } from './components/section-sidebar/section-sidebar';
import { VideoJsPlayerComponent } from './components/videojs-player/videojs-player';

interface TabDef {
  id: 'about' | 'materials' | 'quiz' | 'assignment';
  label: string;
  /** Whether this tab can be locked behind section completion at all. */
  lockable: boolean;
}

@Component({
  selector: 'app-lesson-player',
  imports: [
    AboutTabComponent,
    AssignmentTab,
    QuizTab,
    SectionSidebarComponent,
    MaterialsTabComponent,
    RouterLink,
    VideoJsPlayerComponent,
    NgIcon,
    NgmMotionDirective,
  ],
  templateUrl: './lesson-player.html',
  viewProviders: [
    provideIcons({
      bootstrapChevronLeft,
      bootstrapLockFill,
      bootstrapTrophyFill,
      bootstrapXLg,
    }),
  ],
})
export class LessonPlayerPageComponent implements OnInit {
  private readonly lessonService = inject(LessonService);
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly id = input<string>();

  // Core state
  protected readonly activeTab = signal<TabDef['id']>('about');
  protected readonly activeSection = signal<Section | null>(null);
  protected readonly lesson = signal<LessonPlayerResult | null>(null);
  protected readonly materials = signal<Material[]>([]);
  protected readonly breadcrumbs = signal<Breadcrumb[]>([]);
  protected readonly assignmentSubmission = signal<AssignmentSubmission | null>(null);
  protected readonly loadError = signal<boolean>(false);

  // Celebration state
  protected readonly fx = lessonCelebration;
  protected readonly reducedMotion = prefersReducedMotion();
  /** Section that just finished — drives the sidebar pop + sparkles for ~1.6s. */
  protected readonly justCompletedSectionId = signal<number | null>(null);
  protected readonly showCelebration = signal(false);
  private justCompletedTimer: ReturnType<typeof setTimeout> | undefined;

  // True when we arrived back from the quiz page. Finishing the quiz can be the
  // step that completes the lesson, so that visit is allowed to celebrate.
  private readonly returnedFromQuiz =
    new URLSearchParams(window.location.search).get('quiz') === 'done';

  // Guard so a page refresh or repeated triggers never double-fire the completion call
  private enrollmentCompletionSent = false;

  protected readonly sectionRevealEnterInit = pageEntranceInitial;
  protected readonly sectionRevealAnimate = sectionRevealEnter;
  protected readonly sectionRevealTransition = sectionRevealTransition;

  protected readonly tabs: TabDef[] = [
    { id: 'about', label: 'عن الفصل', lockable: false },
    { id: 'materials', label: 'المواد التعليمية', lockable: false },
    { id: 'quiz', label: 'اختبر نفسك', lockable: true },
    { id: 'assignment', label: 'الواجب المنزلي', lockable: true },
  ];

  // True once every section in the lesson is marked completed
  protected readonly allSectionsCompleted = computed(() => {
    const sections = this.lesson()?.sections ?? [];
    return sections.length > 0 && sections.every((s) => s.isCompleted);
  });

  // The player is rendered from a one-item list keyed by sectionId, so Angular
  // destroys and recreates it on every section switch. That gives each section
  // a clean lifecycle: save-on-destroy for the old one, start + resume for the new.
  protected readonly playerSections = computed(() => {
    const section = this.activeSection();
    return section ? [section] : [];
  });

  // Quiz / assignment tabs only exist when the lesson actually has one —
  // no point showing a locked tab that leads to nothing.
  protected readonly visibleTabs = computed(() => {
    const lesson = this.lesson();
    return this.tabs.filter((tab) => {
      if (tab.id === 'quiz') return !!lesson?.quiz;
      if (tab.id === 'assignment') return !!lesson?.assignment;
      return true;
    });
  });

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.justCompletedTimer));
  }

  public ngOnInit(): void {
    this.loadLesson();

    if (this.returnedFromQuiz) {
      this.activeTab.set('quiz');
    }
  }

  protected retry(): void {
    this.loadLesson();
  }

  private loadLesson(): void {
    this.loadError.set(false);

    this.lessonService.getLessonPlayerDetails(this.id() ?? '').subscribe({
      next: (rawRes) => {
        // `id` is the section's SortOrder. Sorting here guarantees display and
        // gating order no matter what order the query returned rows in.
        const res: LessonPlayerResult = {
          ...rawRes,
          sections: [...(rawRes.sections ?? [])].sort((a, b) => a.id - b.id),
        };
        this.lesson.set(res);

        const extractedMaterials: Material[] = [...(res?.materials ?? [])];
        if (res?.assignment?.contentURL) {
          extractedMaterials.push({
            title: 'واجب الدرس',
            type: 'pdf',
            downloadUrl: res.assignment.contentURL,
          });
        }
        this.materials.set(extractedMaterials);

        this.breadcrumbs.set([
          { label: 'الرئيسية', url: '/home' },
          { label: 'مكتبة الدروس', url: '/lessons' },
          { label: res?.title ?? '' },
        ]);

        const sections = res?.sections ?? [];
        const current = sections.find((s) => !s.isCompleted) ?? sections[0] ?? null;
        this.activeSection.set(current);

        this.enrollmentCompletionSent = res.isEnrollmentCompleted ?? false;

        if (res?.assignment) {
          this.loadAssignmentSubmission(res.id);
        }

        // Covers reloading the page after everything finished in a prior visit
        // but the completion call never landed (e.g. a dropped request).
        // Only celebrates if we just came back from finishing the quiz.
        this.checkAndMarkEnrollmentComplete(this.returnedFromQuiz);
      },
      error: (err) => {
        console.error('Failed to load lesson:', err);
        this.loadError.set(true);
      },
    });
  }

  private loadAssignmentSubmission(lessonId: number): void {
    this.lessonService.getAssignmentSubmission(lessonId).subscribe({
      next: (submission) => {
        this.assignmentSubmission.set(submission);
        this.checkAndMarkEnrollmentComplete(this.returnedFromQuiz);
      },
      error: (err) => console.error('Failed to load assignment submission:', err),
    });
  }

  private checkAndMarkEnrollmentComplete(celebrate = false): void {
    if (this.enrollmentCompletionSent) return;

    const lesson = this.lesson();
    if (!lesson) return;

    const quizDone = !lesson.quiz || lesson.quiz.isAttempted;
    const assignmentDone = !lesson.assignment || this.assignmentSubmission() !== null;

    if (this.allSectionsCompleted() && quizDone && assignmentDone) {
      this.markEnrollmentCompleted(celebrate);
    }
  }

  private markEnrollmentCompleted(celebrate: boolean): void {
    if (this.enrollmentCompletionSent) return;
    this.enrollmentCompletionSent = true;

    const lesson = this.lesson();
    if (!lesson) return;

    this.enrollmentService.markEnrollmentCompleted(lesson.enrollmentId).subscribe({
      next: () => {
        // Keeps the header badge in sync without needing a reload.
        this.lesson.update((l) => (l ? { ...l, isEnrollmentCompleted: true } : l));
        if (celebrate) {
          this.showCelebration.set(true);
        }
      },
      error: (err) => {
        this.enrollmentCompletionSent = false;
        console.error('Failed to mark enrollment as completed:', err);
      },
    });
  }

  protected onSectionCompleted(): void {
    const active = this.activeSection();
    const currentLesson = this.lesson();
    if (!active || !currentLesson) return;

    // Immutable update: new section object, new array, new lesson object.
    // Mutating in place leaves the array reference unchanged, so signal inputs
    // downstream (the sidebar) skip the update — fatal in a zoneless app.
    const sections = currentLesson.sections.map((sec) =>
      sec.id === active.id ? { ...sec, isCompleted: true } : sec,
    );
    this.lesson.set({ ...currentLesson, sections });
    this.activeSection.set({ ...active, isCompleted: true });

    this.celebrateSection(
      active.id,
      sections.every((sec) => sec.isCompleted),
      currentLesson,
    );
    this.checkAndMarkEnrollmentComplete(true);
  }

  private celebrateSection(sectionId: number, isLast: boolean, lesson: LessonPlayerResult): void {
    this.justCompletedSectionId.set(sectionId);
    clearTimeout(this.justCompletedTimer);
    this.justCompletedTimer = setTimeout(() => this.justCompletedSectionId.set(null), 1600);

    if (!isLast) {
      toast.success('أحسنت! أنهيت هذه المحاضرة');
      return;
    }

    if (lesson.quiz && lesson.assignment) {
      toast.success('أنهيت كل المحاضرات! الاختبار والواجب متاحان الآن');
    } else if (lesson.quiz) {
      toast.success('أنهيت كل المحاضرات! الاختبار متاح الآن');
    } else if (lesson.assignment) {
      toast.success('أنهيت كل المحاضرات! الواجب متاح الآن');
    } else {
      toast.success('أنهيت كل محاضرات الفصل، أحسنت');
    }
  }

  protected dismissCelebration(): void {
    this.showCelebration.set(false);
  }

  protected onAssignmentSubmitted(submission: AssignmentSubmission): void {
    this.assignmentSubmission.set(submission);
    this.checkAndMarkEnrollmentComplete(true);
  }

  protected onAssignmentDeleted(): void {
    this.assignmentSubmission.set(null);
  }

  protected onSectionSelected(item: Section): void {
    const sections = this.lesson()?.sections ?? [];
    const itemIndex = sections.findIndex((sec) => sec.id === item.id);
    const nextRequiredIndex = sections.findIndex((sec) => !sec.isCompleted);

    // Reachable = already completed (rewatch) or exactly the next required
    // section. Based on completion state, not on whichever section is playing,
    // so rewatching an old section can't open the door to later ones.
    const isReachable = item.isCompleted || itemIndex === nextRequiredIndex;
    if (!isReachable) {
      toast.warning('أكمل المحاضرة الحالية أولاً');
      return;
    }

    this.activeSection.set(item);
  }

  protected isTabLocked(tab: TabDef): boolean {
    return tab.lockable && !this.allSectionsCompleted();
  }

  protected setTab(tab: TabDef): void {
    if (this.isTabLocked(tab)) {
      toast.warning('أكمل جميع محاضرات الفصل أولاً لفتح هذا القسم');
      return;
    }
    this.activeTab.set(tab.id);
  }
}
