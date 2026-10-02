import { PercentPipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import {
  bootstrapCheckCircleFill,
  bootstrapCheckLg,
  bootstrapLockFill,
  bootstrapPlayCircle,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import {
  lessonCelebration,
  prefersReducedMotion,
} from '../../../../../../core/animations/Lesson-celebration.animations';
import { Section } from '../../../../../../core/Models/Lesson/Lesson-Player';

export interface DisplaySection extends Section {
  status: 'done' | 'current' | 'upcoming';
  isActive: boolean;
}

@Component({
  selector: 'app-section-sidebar',
  imports: [NgIcon, PercentPipe, NgmMotionDirective],
  templateUrl: './section-sidebar.html',
  viewProviders: [
    provideIcons({
      bootstrapCheckLg,
      bootstrapCheckCircleFill,
      bootstrapPlayCircle,
      bootstrapLockFill,
    }),
  ],
})
export class SectionSidebarComponent {
  public readonly sections = input<Section[]>([]);
  public readonly activeItemId = input<number | null>(null);
  public readonly itemSelected = output<Section>();
  /** Section that was just finished — only this one gets the pop + sparkle burst. */
  public readonly justCompletedId = input<number | null>(null);

  protected readonly fx = lessonCelebration;
  protected readonly reducedMotion = prefersReducedMotion();

  // Status reflects each section's place in the required order — 'done'
  // once completed, 'current' for the single next one to finish, 'upcoming'
  // (rendered locked in the template) for anything after that. This is
  // deliberately independent of which section is actually on screen right
  // now (isActive below): rewatching a done section shouldn't make the
  // real next section look unlocked, or vice versa.
  public readonly processedSections = computed<DisplaySection[]>(() => {
    const rawSections = this.sections();
    const activeId = this.activeItemId();
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

      const isActive = activeId !== null ? section.id === activeId : status === 'current';

      return { ...section, status, isActive };
    });
  });

  // Returns decimal fraction (0.0 to 1.0) expected by PercentPipe
  public readonly completionPercentage = computed(() => {
    const rawSections = this.sections();
    if (rawSections.length === 0) return 0;

    const completed = rawSections.filter((s) => s.isCompleted).length;
    return completed / rawSections.length;
  });

  protected onItemClick(section: DisplaySection): void {
    // Locked sections still emit — the parent shows a proper "finish the
    // current lecture first" toast rather than the item just doing nothing.
    this.itemSelected.emit(section);
  }
}