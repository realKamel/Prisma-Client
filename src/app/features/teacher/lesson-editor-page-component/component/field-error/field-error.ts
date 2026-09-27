import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { errorMessage } from '../Utils/form-errors';

/**
 * Usage: <app-field-error [control]="form().get('title')" messageKey="title" />
 * Renders nothing until the control has an error AND is touched/dirty.
 */
@Component({
  selector: 'app-field-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @if (message(); as msg) {
      <p data-field-error class="text-coral mt-1 text-xs">{{ msg }}</p>
    }
  `,
})
export class FieldError {
  readonly control = input<AbstractControl | null>(null);
  readonly messageKey = input.required<string>();

  private readonly tick = signal(0);

  protected readonly message = computed(() => {
    this.tick();
    return errorMessage(this.control(), this.messageKey());
  });

  constructor() {
    effect((onCleanup) => {
      const subscription = this.control()?.events.subscribe(() =>
        this.tick.update((n) => n + 1),
      );
      onCleanup(() => subscription?.unsubscribe());
    });
  }
}