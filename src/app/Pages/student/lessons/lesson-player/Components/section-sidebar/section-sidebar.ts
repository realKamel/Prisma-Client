import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PlaylistItem {
  id: string;
  title: string;
  type: string;
  duration: string;
  isCompleted: boolean;
  // computed
  isActive?: boolean;
  status?: 'done' | 'current' | 'upcoming';
}

export interface CourseSection {
  title: string;
  items: PlaylistItem[];
}

@Component({
  selector: 'app-section-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './section-sidebar.html'
})
export class SectionSidebar implements OnChanges {
  @Input() sections: CourseSection[] = [];
  @Output() itemSelected = new EventEmitter<PlaylistItem>();

  completionPercentage = 0;

ngOnChanges(): void {
  this.computeStatuses();
  this.computePercentage();
}

private computePercentage(): void {
  const allItems = this.sections.flatMap(s => s.items);
  if (allItems.length === 0) return;

  const completed = allItems.filter(i => i.isCompleted).length;
  this.completionPercentage = Math.round((completed / allItems.length) * 100);
}

  private computeStatuses(): void {
    let currentFound = false;

    for (const section of this.sections) {
      for (const item of section.items) {
        if (item.isCompleted) {
          item.status = 'done';
          item.isActive = false;
        } else if (!currentFound) {
          item.status = 'current';
          item.isActive = true;
          currentFound = true;
        } else {
          item.status = 'upcoming';
          item.isActive = false;
        }
      }
    }
  }

  onItemClick(item: PlaylistItem): void {
    this.itemSelected.emit(item);
  }
}