import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface MaterialItem {
  title: string;
  size: string;
  type: 'pdf' | 'ppt' | 'exrc';
  downloadUrl?: string; // أضفنا رابط التحميل اختياريًا لربطه بزر التحميل
}

@Component({
  selector: 'app-materials-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './materials-tab.html'
})
export class MaterialsTab {
  // استلام قائمة المواد التعليمية ديناميكيًا من المكون الأب
  @Input() materialsList: MaterialItem[] = [];
}