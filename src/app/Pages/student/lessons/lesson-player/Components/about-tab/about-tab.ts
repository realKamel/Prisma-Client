import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// تعريف واجهة البيانات (Interface) لتأمين تتبع الأنواع (Type Safety)
export interface AboutTabData {
  description: string;
  objectives: string[];
  totalLessons?: string;  // اختياري إذا أردت تمريرها من الـ JSON لاحقاً
  totalFiles?: string;    // اختياري
  totalQuizzes?: string;  // اختياري
}

@Component({
  selector: 'app-about-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-tab.html'
})
export class AboutTab {
  // استقبال البيانات الممررة من المكوّن الأب
  @Input() data!: AboutTabData;
}