import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PlaylistItem {
  id: string;
  title: string;
  type: string;
  duration: string;
  isActive?: boolean;
  status?: 'done' | 'current' | 'upcoming'; // يمكن حسابها ديناميكيًا أو تمريرها
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
export class SectionSidebar {
  // استقبال مصفوفة الأقسام والفيديوهات من المكون الأب
  @Input() sections: CourseSection[] = [];
  
  // حدث لإبلاغ المكون الأب عند قيام الطالب بالضغط على فيديو آخر لتشغيله
  @Output() itemSelected = new EventEmitter<PlaylistItem>();

  onItemClick(item: PlaylistItem): void {
    this.itemSelected.emit(item);
  }
}