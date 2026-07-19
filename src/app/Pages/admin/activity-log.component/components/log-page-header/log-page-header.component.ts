import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-log-page-header',
  templateUrl: './log-page-header.component.html',
  imports: [RouterLink],
})
export class LogPageHeaderComponent {
  readonly eyebrow = input('// الإدارة');
  readonly title = input('سجل الأنشطة');
  readonly subtitle = input('جميع أحداث المنصة — معلمون، مساعدون، طلاب، ونظام');
  readonly backLink = input('38-admin-dashboard.html');
  readonly backLabel = input('لوحة التحكم');
}
