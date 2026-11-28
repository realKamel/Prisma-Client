import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  Injector,
  input,
  OnInit,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  bootstrapBookmarkFill,
  bootstrapChevronLeft,
  bootstrapFolder2Open,
  bootstrapInfoCircleFill,
  bootstrapJournalCheck,
  bootstrapLayersFill,
  bootstrapLightningFill,
  bootstrapTrophyFill,
  bootstrapXLg,
} from '@ng-icons/bootstrap-icons';
import { TOUR_KEYS, TourStep } from '../../../../core/models/tour.model';
import { autoStartTour } from '../../../../core/services/tours/auto-start-tour';
import { TourService } from '../../../../core/services/tours/tour.service';
import { TourStepDirective } from '../../../../shared/directives/tour-step/tour-step.directive';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { TranslatePipe } from '@ngx-translate/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { toast } from 'ngx-sonner';
import { switchMap } from 'rxjs';
import { EnrollmentService } from '../../../../core/services/enrollment/enrollment.service';
import {
  AssignmentSubmission,
  LessonPlayerResult,
  Material,
  Section,
} from '../../../../domain/lessons/models/Lesson-player.model';
import { LessonService } from '../../../../domain/lessons/services/lesson.service';
import {
  lessonCelebration,
  prefersReducedMotion,
} from '../../../../shared/animations/Lesson-celebration.animations';
import {
  pageEntranceInitial,
  sectionRevealEnter,
  sectionRevealTransition,
} from '../../../../shared/animations/motion.animations';
import { Breadcrumb } from '../../../../shared/models/navigation.model';
import { BookmarksState } from './bookmarks.state';
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
import { AuthStoreService } from '../../../../core/services/auth/auth-store.service';
import { buildWatermarkText } from './components/player-watermark/player-watermark';

interface TabDef {
  id: 'about' | 'materials';
  labelKey: string;
  icon: string;
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
    TranslatePipe,
    TourStepDirective
  ],
  templateUrl: './lesson-player.html',
  // One bookmarks list per lesson page, shared by the player, the sidebar panel and its badge.
  providers: [BookmarksState],
  viewProviders: [
    provideIcons({
      bootstrapChevronLeft,
      bootstrapFolder2Open,
      bootstrapInfoCircleFill,
      bootstrapTrophyFill,
      bootstrapXLg,
    }),
  ],
})
export class LessonPlayerPageComponent implements OnInit {
  private readonly lessonService = inject(LessonService);
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly bookmarks = inject(BookmarksState);
  private readonly player = viewChild(VideoJsPlayerComponent);

  public readonly id = input<string>();
  private readonly auth = inject(AuthStoreService);

  protected readonly watermarkText = computed(() => {
    return buildWatermarkText(this.auth.name(), this.auth.email());
  });

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
    { id: 'about', labelKey: 'LESSON_PLAYER.TABS.ABOUT', icon: 'bootstrapInfoCircleFill' },
    { id: 'materials', labelKey: 'LESSON_PLAYER.TABS.MATERIALS', icon: 'bootstrapFolder2Open' },
  ];
  private readonly tours = inject(TourService);

  /** Set when the player tour is about to run; lets the extras card show placeholders. */
  private readonly tourPreview = signal(false);

  protected readonly previewExtras = computed(
    () =>
      this.tourPreview() &&
      this.extraItems().length === 0 &&
      !this.tours.seenTours().has(TOUR_KEYS.student.player),
  );

  /** Real extras, or two locked placeholders for the tour when the lesson has none. */
  protected readonly shownExtras = computed<LessonExtra[]>(() =>
    this.previewExtras()
      ? [
        { kind: 'quiz', title: 'اختبر نفسك', isDone: false },
        { kind: 'assignment', title: 'الواجب المنزلي', isDone: false },
      ]
      : this.extraItems(),
  );

  private readonly tourSteps: TourStep[] = [
    {
      element: '[data-tour-step="student-player-video"]',
      titleKey: 'TOUR.STUDENT.PLAYER.VIDEO.TITLE',
      descriptionKey: 'TOUR.STUDENT.PLAYER.VIDEO.DESCRIPTION',
      icon: bootstrapLightningFill,
    },
    {
      element: '[data-tour-step="student-player-sections"]',
      titleKey: 'TOUR.STUDENT.PLAYER.SECTIONS.TITLE',
      descriptionKey: 'TOUR.STUDENT.PLAYER.SECTIONS.DESCRIPTION',
      icon: bootstrapLayersFill,
    },
    {
      element: '[data-tour-step="student-player-bookmarks"]',
      titleKey: 'TOUR.STUDENT.PLAYER.BOOKMARKS.TITLE',
      descriptionKey: 'TOUR.STUDENT.PLAYER.BOOKMARKS.DESCRIPTION',
      icon: bootstrapBookmarkFill,
    },
    {
      element: '[data-tour-step="student-player-extras"]',
      titleKey: 'TOUR.STUDENT.PLAYER.EXTRAS.TITLE',
      descriptionKey: 'TOUR.STUDENT.PLAYER.EXTRAS.DESCRIPTION',
      icon: bootstrapJournalCheck,
    },
    {
      element: '[data-tour-step="student-player-tabs"]',
      titleKey: 'TOUR.STUDENT.PLAYER.TABS.TITLE',
      descriptionKey: 'TOUR.STUDENT.PLAYER.TABS.DESCRIPTION',
      side: 'top',
      icon: bootstrapInfoCircleFill,
    },
  ];

  protected readonly activeTabIndex = computed(() =>
    this.tabs.findIndex((t) => t.id === this.activeTab()),
  );

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
        kind: 'assignment',
        title: 'الواجب المنزلي',
        isDone: this.assignmentSubmission() !== null,
      });
    }
    return items;
  });

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.justCompletedTimer));

    // New lecture → new player → new bookmark list.
    effect(() => {
      const sectionId = this.activeSection()?.sectionId ?? null;
      untracked(() => this.bookmarks.setSection(sectionId));
    });
    autoStartTour({
      key: TOUR_KEYS.student.player,
      steps: () => this.tourSteps,
      ready: () =>
        !!this.lesson() && !this.loadError() && this.stage() === 'lecture' && !this.showCelebration(),
      onReady: () => this.tourPreview.set(true),
      onSkip: () => this.tourPreview.set(false),
    });
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

  protected onBookmarkSeek(seconds: number): void {
    // From the quiz or assignment stage, go back to the lecture first.
    if (this.stage() !== 'lecture') this.activeStage.set('lecture');

    const seek = () => this.player()?.seekTo(seconds);
    if (this.player()) seek();
    else afterNextRender(seek, { injector: this.injector });
  }

  protected setTab(tab: TabDef): void {
    this.activeTab.set(tab.id);
  }
}