import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColorPickerComponent }    from './color-picker/color-picker';
import { AnnouncementComponent }   from './announcement/announcement';
import { SectionTogglesComponent } from './section-toggles/section-toggles';

type Tab = 'theme' | 'settings';

@Component({
  selector: 'app-teacher-preference',
  standalone: true,
  imports: [
    CommonModule,
    ColorPickerComponent,
    AnnouncementComponent,
    SectionTogglesComponent,
  ],
  templateUrl: './teacher-preference.html',
})
export class TeacherPreferenceComponent {
  activeTab: Tab = 'theme';

  tabs: { key: Tab; label: string }[] = [
    { key: 'theme',    label: 'المظهر' },
    { key: 'settings', label: 'إعدادات الصفحة' },
  ];

  setTab(tab: Tab) { this.activeTab = tab; }
}