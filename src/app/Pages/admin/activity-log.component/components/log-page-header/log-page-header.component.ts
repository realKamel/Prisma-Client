import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-log-page-header',
  standalone: true,
  templateUrl: './log-page-header.component.html',
})
export class LogPageHeaderComponent {
  @Input() eyebrow = '// الإدارة';
  @Input() title = 'سجل الأنشطة';
  @Input() subtitle = 'جميع أحداث المنصة — معلمون، مساعدون، طلاب، ونظام';
  @Input() backLink = '38-admin-dashboard.html';
  @Input() backLabel = 'لوحة التحكم';
}
