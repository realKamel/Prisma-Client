import { CdkStep, CdkStepper } from '@angular/cdk/stepper';
import { NgTemplateOutlet } from '@angular/common';
import { Component, TemplateRef, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { bootstrapCheckLg } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { map } from 'rxjs';

type StepVisualState = 'current' | 'done' | 'upcoming';

/** Everything the template needs for one step, fully resolved. */
interface StepView {
  index: number;
  label: string;
  labelTemplate: TemplateRef<unknown> | null;
  contentTemplate: TemplateRef<unknown> | null;
  labelId: string;
  contentId: string;
  state: StepVisualState;
  navigable: boolean;
  isLast: boolean;
  indicatorClass: string;
  labelClass: string;
}

const INDICATOR_CLASS: Record<StepVisualState, string> = {
  current: 'border-primary bg-primary text-white shadow-[0_4px_18px_var(--color-primary-glow)]',
  done: 'border-mint bg-[color-mix(in_srgb,var(--color-mint)_18%,transparent)] text-mint',
  upcoming: 'border-border bg-surface-subtle text-muted',
};

const LABEL_CLASS: Record<StepVisualState, string> = {
  current: 'text-ink',
  done: 'text-ink-subtle',
  upcoming: 'text-muted',
};

/**
 * Tailwind-styled stepper built on `CdkStepper`, so step navigation, linear validation
 * and keyboard handling stay in the CDK while the header and content are fully custom.
 * The template only reads the `stepViews()` computed signal: no method calls per change.
 */
@Component({
  selector: 'app-lesson-stepper',
  imports: [NgTemplateOutlet, NgIcon],
  templateUrl: './lesson-stepper.html',
  providers: [{ provide: CdkStepper, useExisting: LessonStepperComponent }],
  viewProviders: [provideIcons({ bootstrapCheckLg })],
})
export class LessonStepperComponent extends CdkStepper {
  /** Mirrors the CDK content query into a signal so `stepViews` reacts to step changes. */
  private readonly stepList = toSignal(this.steps.changes.pipe(map(() => this.steps.toArray())), {
    initialValue: this.steps.toArray(),
  });

  protected readonly stepViews = computed<StepView[]>(() => {
    const selectedIndex = this.selectedIndex;
    const steps = this.stepList();

    return steps.map((step, index) => {
      const state = this.stateOf(step, index, selectedIndex);

      return {
        index,
        label: step.label,
        labelTemplate: step.stepLabel?.template ?? null,
        contentTemplate: step.content,
        labelId: this._getStepLabelId(index),
        contentId: this._getStepContentId(index),
        state,
        navigable: step.isNavigable(),
        isLast: index === steps.length - 1,
        indicatorClass: INDICATOR_CLASS[state],
        labelClass: LABEL_CLASS[state],
      };
    });
  });

  /** Selecting an unreachable step is ignored by `CdkStepper`, which also surfaces its errors. */
  protected select(index: number): void {
    if (index !== this.selectedIndex) this.selectedIndex = index;
  }

  private stateOf(step: CdkStep, index: number, selectedIndex: number): StepVisualState {
    if (index === selectedIndex) return 'current';
    return step.completed && index < selectedIndex ? 'done' : 'upcoming';
  }
}
