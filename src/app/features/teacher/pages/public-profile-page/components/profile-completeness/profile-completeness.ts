import { Component, computed, input } from '@angular/core';
import { bootstrapCheckCircleFill, bootstrapCircle } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { TranslatePipe } from '@ngx-translate/core';

export interface CompletenessItem {
  done: boolean;
  labelKey: string;
  params?: Record<string, unknown>;
}

/** Progress bar plus the list of things still missing, phrased as hints. */
@Component({
  selector: 'app-profile-completeness',
  imports: [NgIcon, TranslatePipe],
  viewProviders: [provideIcons({ bootstrapCheckCircleFill, bootstrapCircle })],
  templateUrl: "./profile-completeness.html"
})
export class ProfileCompletenessComponent {
  public readonly items = input.required<CompletenessItem[]>();

  protected readonly missing = computed(() => this.items().filter((i) => !i.done));
  protected readonly percent = computed(() => {
    const total = this.items().length;
    return total ? Math.round(((total - this.missing().length) / total) * 100) : 0;
  });
}