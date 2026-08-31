import { Component, computed, inject, signal } from '@angular/core';

import { ColorPickerComponent } from './color-picker/color-picker';
import { AnnouncementComponent } from './announcement/announcement';
import { SectionTogglesComponent } from './section-toggles/section-toggles';
import { AppRole } from '../../../core/enums/role-enum';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/Services/auth';

type Tab = 'theme' | 'settings';

@Component({
  selector: 'app-teacher-preference',
  imports: [ColorPickerComponent, AnnouncementComponent, SectionTogglesComponent],
  templateUrl: './teacher-preference.html',
})
export class TeacherPreferenceComponent {
  readonly activeTab = signal<Tab>('theme');
  private router = inject(Router);
  public readonly auth = inject(AuthService);
  readonly tabs: { key: Tab; label: string }[] = [
    { key: 'theme', label: 'المظهر' },
    { key: 'settings', label: 'إعدادات الصفحة' },
  ];
  private readonly normalizedRole = computed(
    () => this.auth.role()?.toString().toLowerCase() as AppRole | undefined,
  );
  navigateTodash() {
    const role = this.normalizedRole();
    if (role === AppRole.ADMIN) {
      this.router.navigate(['/dashboard/admin']);
    } else if (role === AppRole.TEACHER) {
      this.router.navigate(['/dashboard']);
    }
  }
  setTab(tab: Tab) {
    this.activeTab.set(tab);
  }
}
