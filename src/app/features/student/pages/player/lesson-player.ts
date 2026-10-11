import { switchMap } from 'rxjs';
import { Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { bootstrapChevronLeft, bootstrapTrophyFill, bootstrapXLg } from '@ng-icons/bootstrap-icons';
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
import {
  ExtraKind,
  LessonExtra,
  LessonExtrasComponent,
} from './components/lesson-extras/lesson-extras';
import { MaterialsTabComponent } from './components/materials-tab/materials-tab';
import { QuizTab } from './components/quiz-tab/quiz-tab';
import { SectionSidebarComponent } from './components/section-sidebar/section-sidebar';
import { VideoJsPlayerComponent } from './components/videojs-player/videojs-player';

interface TabDef {
  id: 'about' | 'materials';
  label: string;
}

type StageKind = 'lecture' | ExtraKind;

@Component({
  selector: 'app-lesson-player',
  imports: [
    AboutTabComponent,
    AssignmentTab,
    QuizTab,
    SectionSidebarComponent,
    LessonExtrasComponent,
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

  protected readonly activeTab = signal<TabDef['id']>('about');
  protected readonly activeSection = signal<Section | null>(null);
  protected readonly lesson = signal<LessonPlayerResult | null>(null);
  protected readonly materials = signal<Material[]>([]);
  protected readonly breadcrumbs = signal<Breadcrumb[]>([]);
  protected readonly assignmentSubmission = signal<AssignmentSubmission | null>(null);
  protected readonly loadError = signal<boolean>(false);

  private readonly activeStage = signal<StageKind>('lecture');

  protected readonly fx = lessonCelebration;
  protected readonly reducedMotion = prefersReducedMotion();
  protected readonly justCompletedSectionId = signal<number | null>(null);
  protected readonly showCelebration = signal(false);
  private justCompletedTimer: ReturnType<typeof setTimeout> | undefined;

  private readonly returnedFromQuiz =
    new URLSearchParams(window.location.search).get('quiz') === 'done';

  private enrollmentCompletionSent = false;
  private readonly completingSectionIds = new Set<number>();

  protected readonly sectionRevealEnterInit = pageEntranceInitial;
  protected readonly sectionRevealAnimate = sectionRevealEnter;
  protected readonly sectionRevealTransition = sectionRevealTransition;

  protected readonly tabs: TabDef[] = [
    { id: 'about', label: 'عن الفصل' },
    { id: 'materials', label: 'المواد التعليمية' },
  ];

  // True once every section in the lesson is marked completed
  protected readonly allSectionsCompleted = computed(() => {
    const sections = this.lesson()?.sections ?? [];
    return sections.length > 0 && sections.every((s) => s.isCompleted);
  });

  protected readonly stage = computed<StageKind>(() => {
    const requested = this.activeStage();
    if (requested === 'lecture') return 'lecture';

    const lesson = this.lesson();
    if (!this.allSectionsCompleted()) return 'lecture';
    if (requested === 'quiz' && !lesson?.quiz) return 'lecture';
    if (requested === 'assignment' && !lesson?.assignment) return 'lecture';
    return requested;
  });

  protected readonly activeExtraKind = computed<ExtraKind | null>(() => {
    const stage = this.stage();
    return stage === 'lecture' ? null : stage;
  });

  protected readonly playerSections = computed(() => {
    const section = this.activeSection();
    return section ? [section] : [];
  });

  protected readonly extraItems = computed<LessonExtra[]>(() => {
    const lesson = this.lesson();
    if (!lesson) return [];

    const items: LessonExtra[] = [];
    if (lesson.quiz) {
      items.push({ kind: 'quiz', title: 'اختبر نفسك', isDone: !!lesson.quiz.isAttempted });
    }
    if (lesson.assignment) {
      items.push({
        kind: 'assignment', title: 'الواجب المنزلي', isDone: this.assignmentSubmission() !== null,
      });
    }
    return items;
  });

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.justCompletedTimer));
  }

  public ngOnInit(): void {
    this.loadLesson();

    if (this.returnedFromQuiz) {
      this.activeStage.set('quiz');
    }
  }

  protected retry(): void {
    this.loadLesson();
  }

  private loadLesson(): void {
    this.loadError.set(false);

    this.lessonService.getLessonPlayerDetails(this.id() ?? '').subscribe({
      next: (rawRes) => {
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

        if (current) this.completeIfNoVideo(current);


        if (res?.assignment) {
          this.loadAssignmentSubmission(res.id);
        }

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
    if (!lesson || lesson.isEnrollmentCompleted) return;

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
    if (!lesson || lesson.isEnrollmentCompleted) return;

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

  protected onSectionCompleted(sectionId?: number): void {
    const currentLesson = this.lesson();
    const active = this.activeSection();
    const targetId = sectionId ?? active?.id;
    if (targetId === undefined || !currentLesson) return;

    // Immutable update: new section object, new array, new lesson object.
    // Mutating in place leaves the array reference unchanged, so signal inputs
    // downstream (the sidebar) skip the update — fatal in a zoneless app.
    const sections = currentLesson.sections.map((sec) =>
      sec.id === targetId ? { ...sec, isCompleted: true } : sec,
    );
    this.lesson.set({ ...currentLesson, sections });

    if (active && active.id === targetId) {
      this.activeSection.set({ ...active, isCompleted: true });
    }

    this.celebrateSection(
      targetId,
      sections.every((sec) => sec.isCompleted),
      currentLesson,
    );
    this.checkAndMarkEnrollmentComplete(true);
  }

  private completeIfNoVideo(section: Section): void {
    const latest = this.lesson()?.sections.find((s) => s.id === section.id);
    if (!latest || latest.isCompleted || latest.contentUrl) return;
    if (this.completingSectionIds.has(latest.id)) return;

    this.completingSectionIds.add(latest.id);

    this.lessonService
      .startSectionProgress(latest.sectionId)
      .pipe(switchMap(() => this.lessonService.completeSectionProgress(latest.sectionId)))
      .subscribe({
        next: () => {
          this.completingSectionIds.delete(latest.id);
          this.onSectionCompleted(latest.id);
        },
        error: (err) => {
          this.completingSectionIds.delete(latest.id);
          console.error('Failed to mark section as completed', err);
        },
      });
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

    const isReachable = item.isCompleted || itemIndex === nextRequiredIndex;
    if (!isReachable) {
      toast.warning('أكمل المحاضرة الحالية أولاً');
      return;
    }

    this.activeStage.set('lecture');
    this.activeSection.set(item);
    this.completeIfNoVideo(item);
  }

  protected onExtraSelected(kind: ExtraKind): void {
    if (!this.allSectionsCompleted()) {
      toast.warning('أكمل جميع محاضرات الفصل أولاً لفتح هذا القسم');
      return;
    }
    this.activeStage.set(kind);
  }

  protected setTab(tab: TabDef): void {
    this.activeTab.set(tab.id);
  }
}