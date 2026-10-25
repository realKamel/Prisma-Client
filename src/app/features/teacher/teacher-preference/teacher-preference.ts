import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { AppRole } from '../../../core/enums/role-enum';
import { AuthService } from '../../../core/Services/auth';
import { AnnouncementComponent } from '../pages/teacher-preference/announcement/announcement';
import { ColorPickerComponent } from '../pages/teacher-preference/color-picker/color-picker';
import { SectionTogglesComponent } from '../pages/teacher-preference/section-toggles/section-toggles';

type Tab = 'theme' | 'settings';

@Component({
  selector: 'app-teacher-preference',
  imports: [
    ColorPickerComponent,
    AnnouncementComponent,
    SectionTogglesComponent,
    NgmMotionDirective,
  ],
  templateUrl: './teacher-preference.html',
})
export class TeacherPreferenceComponent {
  protected readonly activeTab = signal<Tab>('theme');
  private router = inject(Router);
  public readonly auth = inject(AuthService);
  protected readonly tabs: { key: Tab; label: string }[] = [
    { key: 'theme', label: 'المظهر' },
    { key: 'settings', label: 'إعدادات الصفحة' },
  ];
  private readonly normalizedRole = computed(
    () => this.auth.role()?.toString().toLowerCase() as AppRole | undefined,
  );
  protected navigateTodash() {
    const role = this.normalizedRole();
    if (role === AppRole.ADMIN) {
      void this.router.navigate(['/dashboard/admin']);
    } else if (role === AppRole.TEACHER) {
      void this.router.navigate(['/dashboard']);
    }
  }
  protected setTab(tab: Tab) {
    this.activeTab.set(tab);
  }
}
