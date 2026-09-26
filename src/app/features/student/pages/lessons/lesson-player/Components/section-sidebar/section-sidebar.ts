import { PercentPipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import {
  bootstrapCheckCircleFill,
  bootstrapCheckLg,
  bootstrapPlayCircle,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Section } from '../../../../../../../core/Models/Lesson/Lesson-Player';

export interface DisplaySection extends Section {
  status: 'done' | 'current' | 'upcoming';
  isActive: boolean;
}

@Component({
  selector: 'app-section-sidebar',
  imports: [NgIcon, PercentPipe],
  templateUrl: './section-sidebar.html',
  viewProviders: [
    provideIcons({
      bootstrapCheckLg,
      bootstrapCheckCircleFill,
      bootstrapPlayCircle,
    }),
  ],
})
export class SectionSidebarComponent {
  public readonly sections = input<Section[]>([]);
  public readonly activeItemId = input<number | null>(null);
  public readonly itemSelected = output<Section>();

  // Computed section statuses without mutating input data directly
  public readonly processedSections = computed<DisplaySection[]>(() => {
    const rawSections = this.sections();
    const activeId = this.activeItemId();
    let currentFound = false;

    return rawSections.map((section) => {
      let isActive = false;
      let status: 'done' | 'current' | 'upcoming' = 'upcoming';

      if (activeId !== null) {
        isActive = section.id === activeId;
        status = section.isCompleted ? 'done' : isActive ? 'current' : 'upcoming';
      } else {
        if (section.isCompleted) {
          status = 'done';
          isActive = false;
        } else if (!currentFound) {
          status = 'current';
          isActive = true;
          currentFound = true;
        } else {
          status = 'upcoming';
          isActive = false;
        }
      }

      return {
        ...section,
        isActive,
        status,
      };
    });
  });

  // Returns decimal fraction (0.0 to 1.0) expected by PercentPipe
  public readonly completionPercentage = computed(() => {
    const rawSections = this.sections();
    if (rawSections.length === 0) return 0;

    const completed = rawSections.filter((s) => s.isCompleted).length;
    return completed / rawSections.length;
  });

  protected onItemClick(section: Section): void {
    this.itemSelected.emit(section);
  }
}
