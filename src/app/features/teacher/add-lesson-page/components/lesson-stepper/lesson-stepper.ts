import { CdkStep, CdkStepper } from '@angular/cdk/stepper';
import { NgTemplateOutlet } from '@angular/common';
import { Component } from '@angular/core';
import { bootstrapCheckLg } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';

type StepVisualState = 'current' | 'done' | 'upcoming';

/**
 * Tailwind-styled stepper built on `CdkStepper`, so step navigation, linear validation
 * and keyboard handling stay in the CDK while the header and content are fully custom.
 */
@Component({
  selector: 'app-lesson-stepper',
  imports: [NgTemplateOutlet, NgIcon],
  templateUrl: './lesson-stepper.html',
  providers: [{ provide: CdkStepper, useExisting: LessonStepperComponent }],
  viewProviders: [provideIcons({ bootstrapCheckLg })],
})
export class LessonStepperComponent extends CdkStepper {
  protected stateOf(step: CdkStep): StepVisualState {
    if (step.isSelected()) return 'current';
    return step.index() < this.selectedIndex && step.completed ? 'done' : 'upcoming';
  }

  /** Selecting an unreachable step is ignored by `CdkStepper`, which also surfaces its errors. */
  protected select(index: number): void {
    if (index === this.selectedIndex) return;
    this.selectedIndex = index;
  }

  protected indicatorClass(state: StepVisualState): string {
    switch (state) {
      case 'current':
        return 'border-primary bg-primary text-white shadow-[0_4px_18px_var(--color-primary-glow)]';
      case 'done':
        return 'border-mint bg-[color-mix(in_srgb,var(--color-mint)_18%,transparent)] text-mint';
      default:
        return 'border-border bg-surface-subtle text-muted';
    }
  }

  protected labelClass(state: StepVisualState): string {
    switch (state) {
      case 'current':
        return 'text-ink';
      case 'done':
        return 'text-ink-subtle';
      default:
        return 'text-muted';
    }
  }
}
