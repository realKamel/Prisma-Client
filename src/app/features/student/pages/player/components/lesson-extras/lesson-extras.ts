import { Component, computed, input, output } from '@angular/core';
import {
  bootstrapCheckLg,
  bootstrapFileEarmarkText,
  bootstrapJournalCheck,
  bootstrapLockFill,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';

export type ExtraKind = 'quiz' | 'assignment';

export interface LessonExtra {
  kind: ExtraKind;
  title: string;
  isDone: boolean;
}

interface DisplayExtra extends LessonExtra {
  label: string;
  icon: string;
  status: 'done' | 'current' | 'locked';
  isActive: boolean;
}

const ICONS: Record<ExtraKind, string> = {
  quiz: 'bootstrapJournalCheck',
  assignment: 'bootstrapFileEarmarkText',
};

const LABELS: Record<ExtraKind, string> = {
  quiz: 'اختبار تقييمي',
  assignment: 'واجب منزلي',
};

@Component({
  selector: 'app-lesson-extras',
  imports: [NgIcon],
  templateUrl: './lesson-extras.html',
  viewProviders: [
    provideIcons({
      bootstrapCheckLg,
      bootstrapFileEarmarkText,
      bootstrapJournalCheck,
      bootstrapLockFill,
    }),
  ],
})
export class LessonExtrasComponent {
  public readonly extras = input<LessonExtra[]>([]);
  /** True once every lecture is completed. */
  public readonly unlocked = input(false);
  public readonly activeKind = input<ExtraKind | null>(null);
  public readonly selected = output<ExtraKind>();

  protected readonly items = computed<DisplayExtra[]>(() => {
    const unlocked = this.unlocked();
    const active = this.activeKind();

    return this.extras().map((extra) => {
      let status: DisplayExtra['status'];
      if (!unlocked) {
        status = 'locked';
      } else {
        status = extra.isDone ? 'done' : 'current';
      }

      return {
        ...extra,
        label: LABELS[extra.kind],
        icon: ICONS[extra.kind],
        status,
        isActive: active === extra.kind,
      };
    });
  });

  protected onItemClick(item: DisplayExtra): void {
    // Locked items still emit — the parent shows the "finish the lectures first" toast.
    this.selected.emit(item.kind);
  }
}