import { PercentPipe } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import {
  bootstrapCheckCircleFill,
  bootstrapCheckLg,
  bootstrapChevronDown,
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
      bootstrapChevronDown,
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

  protected readonly fx = lessonCelebration;
  protected readonly reducedMotion = prefersReducedMotion();

  protected readonly isOpen = signal(true);

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

  protected toggle(): void {
    this.isOpen.update((open) => !open);
  }

  protected onItemClick(section: DisplaySection): void {
    this.itemSelected.emit(section);
  }
}