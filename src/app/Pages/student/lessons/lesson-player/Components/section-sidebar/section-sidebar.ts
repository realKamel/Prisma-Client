import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Section } from '../../../../../../core/Models/Lesson/Lesson-Player';

@Component({
  selector: 'app-section-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './section-sidebar.html'
})
export class SectionSidebar implements OnChanges {
  @Input() sections: Section[] = [];
  @Input() activeItemId: number | null = null;
  @Output() itemSelected = new EventEmitter<Section>();

  completionPercentage = 0;

  ngOnChanges(): void {
    this.computeStatuses();
    this.computePercentage();
  }

  private computePercentage(): void {
    if (this.sections.length === 0) return;
    const completed = this.sections.filter(s => s.isCompleted).length;
    this.completionPercentage = Math.round((completed / this.sections.length) * 100);
  }

  private computeStatuses(): void {
    let currentFound = false;

    for (const section of this.sections) {
      if (this.activeItemId !== null) {
        section.isActive = section.id === this.activeItemId;
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