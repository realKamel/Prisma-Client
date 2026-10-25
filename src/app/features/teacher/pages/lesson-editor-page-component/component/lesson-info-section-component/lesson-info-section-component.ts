import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { ControlContainer, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { form, FormField, min, required } from '@angular/forms/signals';
import { bootstrapBook } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { DurationPipe } from '../../../../../../core/pipes/duration-pipe/duration-pipe';
import { FieldError } from '../field-error/field-error';

interface DayHour {
  days: number;
  hours: number;
}

const SECONDS_IN_DAY = 86_400;
const SECONDS_IN_HOUR = 3_600;

@Component({
  selector: 'app-lesson-info-section',
  imports: [ReactiveFormsModule, NgIcon, FieldError, NgSelectComponent, FormField, DurationPipe],
  templateUrl: './lesson-info-section-component.html',
  styleUrl: './lesson-info-section-component.css',
  viewProviders: [
    provideIcons({
      bootstrapBook,
    }),
  ],
})
export class LessonInfoSectionComponent {
  /** Explicit group, for usage outside a `formGroupName` (the lesson editor). */
  public readonly form = input<FormGroup | null>(null);

  public readonly prerequisitesOptions = input<
    {
      id: number;
      name: string;
    }[]
  >([]);

  private readonly container = inject(ControlContainer, { optional: true });

  /**
   * `FormGroupName` assigns its control in `ngOnChanges`, after this component is created,
   * so the group is resolved lazily whenever it is needed instead of in the constructor.
   */
  protected get formGroup(): FormGroup {
    const explicit = this.form();
    if (explicit) return explicit;

    const inherited = this.container?.control;
    if (!(inherited instanceof FormGroup)) {
      throw new Error('app-lesson-info-section needs a [form] input or an ancestor formGroupName.');
    }

    return inherited;
  }

  private readonly durationsModel = signal<DayHour>({ days: 0, hours: 0 });

  public readonly durationForm = form(this.durationsModel, (path) => {
    required(path.days, { message: 'Days are required' });
    min(path.days, 0, { message: 'Days must be at least 0' });

    required(path.hours, { message: 'Hours are required' });
    min(path.hours, 0, { message: 'Hours must be at least 0' });
  });

  protected readonly currencies = [
    { name: 'جنيه مصري', code: 'EGP' },
    { name: 'دولار امريكي', code: 'USD' },
  ];

  protected readonly durationSum = computed(() => {
    const { days, hours } = this.durationsModel();
    return days * SECONDS_IN_DAY + hours * SECONDS_IN_HOUR;
  });

  constructor() {
    // Runs once after the first render, when the surrounding form group is already resolved.
    effect((onCleanup) => {
      const control = this.formGroup.get('validityDurationInSeconds');

      const subscription = control?.valueChanges.subscribe((value: number | null) =>
        this.syncFromParent(value),
      );
      onCleanup(() => subscription?.unsubscribe());

      untracked(() => this.syncFromParent(control?.value as number | null));
    });

    // Direction: duration model -> parent form (when the user edits the signal form inputs)
    effect(() => {
      const total = this.durationSum();
      const control = this.formGroup.get('validityDurationInSeconds');

      if (control && control.value !== total) {
        control.patchValue(total, { emitEvent: false });
      }
    });
  }

  protected updateDateValue(value: number): void {
    this.durationsModel.set({ days: value, hours: 0 });
  }

  private syncFromParent(durationInSeconds: number | null | undefined): void {
    if (!durationInSeconds || durationInSeconds <= 0) return;

    const days = Math.floor(durationInSeconds / SECONDS_IN_DAY);
    const hours = Math.floor((durationInSeconds % SECONDS_IN_DAY) / SECONDS_IN_HOUR);

    if (this.durationsModel().days !== days || this.durationsModel().hours !== hours) {
      this.durationsModel.set({ days, hours });
    }
  }
}
