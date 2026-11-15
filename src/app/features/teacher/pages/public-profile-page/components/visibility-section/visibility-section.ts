import { Component, input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ProfileStats, ProfileVisibility } from '../../../../models/my-profile.model';

interface VisibilityItem {
  key: keyof ProfileVisibility;
  labelKey: string;
  /** Current value shown next to the toggle, so the teacher knows what he is turning on or off. */
  valueOf?: (stats: ProfileStats) => number;
}

const V = 'TEACHER_PROFILE_PAGE.VISIBILITY.';

/** Switch list bound to the `visibility` form group. */
@Component({
  selector: 'app-visibility-section',
  imports: [TranslatePipe],
  templateUrl: "./visibility-section.html"
})
export class VisibilitySectionComponent {
  public readonly group = input.required<FormGroup>();
  public readonly stats = input<ProfileStats | null>(null);

  protected readonly items: readonly VisibilityItem[] = [
    { key: 'showYearsOfExperience', labelKey: `${V}YEARS` , valueOf: undefined},
    { key: 'showContactLinks', labelKey: `${V}LINKS` , valueOf: undefined},
    { key: 'showStudentsCount', labelKey: `${V}STUDENTS`, valueOf: (s) => s.studentsCount },
    { key: 'showLessonsCount', labelKey: `${V}LESSONS`, valueOf: (s) => s.lessonsCount },
    { key: 'showPopularLessons', labelKey: `${V}POPULAR`, valueOf: (s) => s.popularLessons.length },
  ];

  protected isOn(key: keyof ProfileVisibility): boolean {
    return !!this.group().get(key)?.value;
  }

  protected toggle(key: keyof ProfileVisibility): void {
    const control = this.group().get(key);
    if (!control) return;
    control.setValue(!control.value);
    control.markAsDirty();
  }

  protected currentValue(item: VisibilityItem): number | null {
    const stats = this.stats();
    return stats && item.valueOf ? item.valueOf(stats) : null;
  }
}