import { Component, computed, effect, input, OnDestroy, OnInit, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { form, FormField, min, required } from '@angular/forms/signals';
import { bootstrapBook } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Subject, takeUntil } from 'rxjs';
import { DurationPipe } from '../../../../../core/pipes/duration-pipe/duration-pipe';
import { FieldError } from '../field-error/field-error';

interface DayHour {
  days: number;
  hours: number;
}

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
export class LessonInfoSectionComponent implements OnInit, OnDestroy {
  private readonly durationsModel = signal<DayHour>({ days: 0, hours: 0 });
  public readonly form = input.required<FormGroup>();

  public readonly durationForm = form(this.durationsModel, (path) => {
    required(path.days, { message: 'Days are required' });
    min(path.days, 0, { message: 'Days must be at least 0' });

    required(path.hours, { message: 'Hours are required' });
    min(path.hours, 0, { message: 'Hours must be at least 0' });
  });

  private destroy$ = new Subject<void>();
  private isUpdatingFromParent = false;

  protected readonly currencies = [
    { name: 'جنيه مصري', code: 'EGP' },
    { name: 'دولار امريكي', code: 'USD' },
  ];

  public readonly prerequisitesOptions = input<
    {
      id: number;
      name: string;
    }[]
  >([]);

  // Pure computed signal for total seconds
  protected readonly durationSum = computed(() => {
    const days = this.durationsModel().days;
    const hours = this.durationsModel().hours;
    return days * 86400 + hours * 3600;
  });

  public ngOnInit(): void {
    const control = this.form().get('validityDurationInSeconds');

    if (control) {
      // 1. Listen to parent form changes (handles async API data loading)
      control.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((durationInSeconds) => {
        if (this.isUpdatingFromParent) return;

        if (durationInSeconds && durationInSeconds > 0) {
          const SECONDS_IN_DAY = 86400;
          const SECONDS_IN_HOUR = 3600;

          const days = Math.floor(durationInSeconds / SECONDS_IN_DAY);
          const remainingSeconds = durationInSeconds % SECONDS_IN_DAY;
          const hours = Math.floor(remainingSeconds / SECONDS_IN_HOUR);

          if (this.durationsModel().days !== days || this.durationsModel().hours !== hours) {
            this.durationsModel.set({ days, hours });
          }
        }
      });

      // 2. Handle initial value if already present when component mounts
      const initialValue = control.value;
      if (initialValue && initialValue > 0) {
        const days = Math.floor(initialValue / 86400);
        const hours = Math.floor((initialValue % 86400) / 3600);
        this.durationsModel.set({ days, hours });
      }
    }
  }

  constructor() {
    // 3. Direction: Model -> Parent Form (when user types into the Signal Form inputs)
    effect(() => {
      const total = this.durationSum();
      const control = this.form().get('validityDurationInSeconds');

      if (control && control.value !== total) {
        this.isUpdatingFromParent = true;
        control.patchValue(total, { emitEvent: false });
        this.isUpdatingFromParent = false;
      }
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected updateDateValue(val: number) {
    this.durationsModel.set({ days: val, hours: 0 });
  }
}
