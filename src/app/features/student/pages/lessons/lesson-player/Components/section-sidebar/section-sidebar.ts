import { Component, OnChanges, output, input } from '@angular/core';
import { Section } from '../../../../../../../core/Models/Lesson/Lesson-Player';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapCheckCircleFill,
  bootstrapCheckLg,
  bootstrapPlayCircle,
} from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-section-sidebar',
  imports: [NgIcon],
  templateUrl: './section-sidebar.html',
  viewProviders: [
    provideIcons({
      bootstrapCheckLg,
      bootstrapCheckCircleFill,
      bootstrapPlayCircle,
    }),
  ],
})
export class SectionSidebar implements OnChanges {
  readonly sections = input<Section[]>([]);
  readonly activeItemId = input<number | null>(null);
  readonly itemSelected = output<Section>();

  completionPercentage = 0;

  ngOnChanges(): void {
    this.computeStatuses();
    this.computePercentage();
  }

  private computePercentage(): void {
    const sections = this.sections();
    if (sections.length === 0) return;
    const completed = sections.filter((s) => s.isCompleted).length;
    this.completionPercentage = Math.round((completed / sections.length) * 100);
  }

  private computeStatuses(): void {
    let currentFound = false;

    for (const section of this.sections()) {
      const activeItemId = this.activeItemId();
      if (activeItemId !== null) {
        section.isActive = section.id === activeItemId;
        section.status = section.isCompleted ? 'done' : section.isActive ? 'current' : 'upcoming';
      } else {
        if (section.isCompleted) {
          section.status = 'done';
          section.isActive = false;
        } else if (!currentFound) {
          section.status = 'current';
          section.isActive = true;
          currentFound = true;
        } else {
          section.status = 'upcoming';
          section.isActive = false;
        }
      }
    }
  }

  onItemClick(section: Section): void {
    this.itemSelected.emit(section);
  }
}
