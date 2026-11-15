import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { formError } from './form-error';

/**
 * Usage: <app-form-error [control]="form.get('title')" [overrides]="{ required: 'MY.KEY' }" />
 * Renders nothing until the control has an error AND is touched/dirty.
 */
@Component({
  selector: 'app-form-error',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @if (message(); as msg) {
      <p
        data-field-error
        role="alert"
        class="text-coral mt-1.5 text-xs"
      >
        {{ msg.key | translate: msg.params }}
      </p>
    }
  `,
})
export class FormErrorComponent {
  readonly control = input<AbstractControl | null>(null);
  readonly overrides = input<Record<string, string> | undefined>(undefined);

  private readonly tick = signal(0);

  protected readonly message = computed(() => {
    this.tick();
    return formError(this.control(), this.overrides());
  });

  constructor() {
    effect((onCleanup) => {
      const subscription = this.control()?.events.subscribe(() => this.tick.update((n) => n + 1));
      onCleanup(() => subscription?.unsubscribe());
    });
  }
}