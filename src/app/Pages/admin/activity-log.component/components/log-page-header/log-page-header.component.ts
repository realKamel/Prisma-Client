import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { bootstrapSpeedometer2 } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';

@Component({
  selector: 'app-log-page-header',
  templateUrl: './log-page-header.component.html',
  imports: [RouterLink, NgIcon],
  viewProviders: [
    provideIcons({
      bootstrapSpeedometer2,
    }),
  ],
})
export class LogPageHeaderComponent {
  readonly eyebrow = input('// الإدارة');
  readonly title = input('سجل الأنشطة');
  readonly subtitle = input('جميع أحداث المنصة — معلمون، مساعدون، طلاب، ونظام');
  readonly backLink = input('38-admin-dashboard.html');
  readonly backLabel = input('لوحة التحكم');
}
