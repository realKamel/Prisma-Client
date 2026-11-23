import { PercentPipe } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  bootstrapBookmarkFill,
  bootstrapCheckCircleFill,
  bootstrapCheckLg,
  bootstrapChevronDown,
  bootstrapLayersFill,
  bootstrapLockFill,
  bootstrapPlayCircle,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { TranslatePipe } from '@ngx-translate/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { Section } from '../../../../../../domain/lessons/models/Lesson-player.model';
import {
  lessonCelebration,
  prefersReducedMotion,
} from '../../../../../../shared/animations/Lesson-celebration.animations';
import { DurationPipe } from '../../../../../../shared/pipes/duration/duration-pipe';
import { BookmarksPanelComponent } from '../bookmarks-panel/bookmarks-panel';

export interface DisplaySection extends Section {
  status: 'done' | 'current' | 'upcoming';
  isActive: boolean;
}

type SidebarMode = 'sections' | 'bookmarks';

@Component({
  selector: 'app-section-sidebar',
  imports: [
    NgIcon,
    PercentPipe,
    NgmMotionDirective,
    DurationPipe,
    TranslatePipe,
    BookmarksPanelComponent,
  ],
  templateUrl: './section-sidebar.html',
  viewProviders: [
    provideIcons({
      bootstrapBookmarkFill,
      bootstrapCheckLg,
      bootstrapCheckCircleFill,
      bootstrapChevronDown,
      bootstrapLayersFill,
      bootstrapPlayCircle,
      bootstrapLockFill,
    }),
  ],
})
export class SectionSidebarComponent {
  public readonly sections = input<Section[]>([]);
  public readonly activeItemId = input<number | null>(null);
  public readonly lectureActive = input(true);
  public readonly itemSelected = output<Section>();
  public readonly justCompletedId = input<number | null>(null);
  public readonly bookmarkCount = input(0);
  public readonly bookmarkSeek = output<number>();

  protected readonly fx = lessonCelebration;
  protected readonly reducedMotion = prefersReducedMotion();

  protected readonly isOpen = signal(true);
  protected readonly mode = signal<SidebarMode>('sections');
  /** True briefly after a switch, so the card height animates then and only then. */
  protected readonly switching = signal(false);

  private switchTimer: ReturnType<typeof setTimeout> | undefined;
  private readonly sectionsPane = viewChild<ElementRef<HTMLElement>>('sectionsPane');
  private readonly bookmarksPane = viewChild<ElementRef<HTMLElement>>('bookmarksPane');
  private readonly sectionsHeight = signal(0);
  private readonly bookmarksHeight = signal(0);

  /** Height of the pane being shown; null until measured, so first paint is natural. */
  protected readonly bodyHeight = computed(() => {
    const h = this.mode() === 'sections' ? this.sectionsHeight() : this.bookmarksHeight();
    return h > 0 ? h : null;
  });

  public readonly processedSections = computed<DisplaySection[]>(() => {
    const rawSections = this.sections();
    const activeId = this.activeItemId();
    const lectureActive = this.lectureActive();
    const firstIncompleteIndex = rawSections.findIndex((s) => !s.isCompleted);

    return rawSections.map((section, index) => {
      let status: DisplaySection['status'];
      if (section.isCompleted) {
        status = 'done';
      } else if (index === firstIncompleteIndex) {
        status = 'current';
      } else {
        status = 'upcoming';
      }

      const isActive =
        lectureActive && (activeId !== null ? section.id === activeId : status === 'current');

      return { ...section, status, isActive };
    });
  });

  public readonly completionPercentage = computed(() => {
    const rawSections = this.sections();
    if (rawSections.length === 0) return 0;

    const completed = rawSections.filter((s) => s.isCompleted).length;
    return completed / rawSections.length;
  });

  /** Name of the lecture being watched, shown at the top of the bookmarks panel. */
  protected readonly activeTitle = computed(() => {
    const sections = this.sections();
    const id = this.activeItemId();
    const active =
      id !== null ? sections.find((s) => s.id === id) : sections.find((s) => !s.isCompleted);
    return active?.title ?? '';
  });

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const sections = this.sectionsPane()?.nativeElement;
      const bookmarks = this.bookmarksPane()?.nativeElement;

      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const height = Math.ceil(entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height);
          if (entry.target === sections) this.sectionsHeight.set(height);
          else if (entry.target === bookmarks) this.bookmarksHeight.set(height);
        }
      });

      if (sections) observer.observe(sections);
      if (bookmarks) observer.observe(bookmarks);
      destroyRef.onDestroy(() => observer.disconnect());
    });

    destroyRef.onDestroy(() => clearTimeout(this.switchTimer));
  }

  protected setMode(mode: SidebarMode): void {
    if (mode === this.mode()) return;

    this.switching.set(true);
    this.mode.set(mode);
    clearTimeout(this.switchTimer);
    this.switchTimer = setTimeout(() => this.switching.set(false), 450);
  }

  protected toggle(): void {
    this.isOpen.update((open) => !open);
  }

  protected onItemClick(section: DisplaySection): void {
    this.itemSelected.emit(section);
  }
}