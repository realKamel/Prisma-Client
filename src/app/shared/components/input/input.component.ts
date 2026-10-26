import {
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgControl, type ControlValueAccessor } from '@angular/forms';
import { bootstrapSearch, bootstrapX } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMail } from '@ng-icons/lucide';
import { phosphorEyeBold, phosphorEyeSlashBold } from '@ng-icons/phosphor-icons/bold';
import { phosphorDeviceMobileCameraDuotone } from '@ng-icons/phosphor-icons/duotone';
import {
  phosphorHash,
  phosphorLink,
  phosphorLockSimple,
  phosphorTextT,
  phosphorWarningCircle,
} from '@ng-icons/phosphor-icons/regular';
import {
  NgmMotionDirective,
  type TargetAndTransition,
  type Transition,
} from '@scripttype/ng-motion';
import { twMerge } from 'tailwind-merge';
import {
  invalidFieldRest,
  invalidFieldShake,
  invalidFieldTransition,
} from '../../animations/motion.animations';

export type InputType = 'text' | 'email' | 'password' | 'tel' | 'number' | 'search' | 'url';

interface ControlState {
  invalid: boolean;
  valid: boolean;
  touched: boolean;
  dirty: boolean;
  empty: boolean;
}

/** Decorative leading icon per supported type. */
const TYPE_ICONS: Record<InputType, string> = {
  text: 'phosphorTextT',
  email: 'lucideMail',
  password: 'phosphorLockSimple',
  tel: 'phosphorDeviceMobileCameraDuotone',
  number: 'phosphorHash',
  search: 'bootstrapSearch',
  url: 'phosphorLink',
};

/** Digits only — `tel` fields reject pasted separators and letters. */
const DIGITS_ONLY = /\D/g;

@Component({
  selector: 'app-input',
  imports: [NgIcon, NgmMotionDirective],
  templateUrl: './input.component.html',
  viewProviders: [
    provideIcons({
      phosphorTextT,
      lucideMail,
      phosphorLockSimple,
      phosphorDeviceMobileCameraDuotone,
      phosphorHash,
      phosphorLink,
      bootstrapSearch,
      bootstrapX,
      phosphorWarningCircle,
      phosphorEyeBold,
      phosphorEyeSlashBold,
    }),
  ],
})
export class InputComponent implements ControlValueAccessor, OnInit {
  private static nextId = 0;

  /** Optional so the component also works standalone, without a form control. */
  private readonly ngControl = inject(NgControl, { self: true, optional: true });
  private readonly destroyRef = inject(DestroyRef);

  /* ── Identity / a11y ── */
  public readonly fieldId = input<string>(`app-input-${++InputComponent.nextId}`);

  /* ── Content ── */
  public readonly type = input<InputType>('text');
  public readonly label = input<string | null>(null);
  public readonly placeholder = input<string | null>(null);
  /** Helper copy shown while there is no error. */
  public readonly hint = input<string | null>(null);
  /** Caller-supplied (already translated) error copy. Takes over the hint slot. */
  public readonly errorMessage = input<string | null>(null);
  public readonly required = input<boolean>(false);
  public readonly isDisabled = input<boolean>(false);
  public readonly autocomplete = input<string | null>(null);
  public readonly inputMode = input<
    'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search' | null
  >(null);
  public readonly inputDir = input<'ltr' | 'rtl' | null>(null);
  public readonly maxLength = input<number | null>(null);
  /** Restyles the native input; merged with `tailwind-merge` so overrides win. */
  public readonly className = input<string>();

  /* ── Icons & actions ── */
  public readonly showIcon = input<boolean>(true);
  public readonly iconPosition = input<'start' | 'end'>('start');
  public readonly clearable = input<boolean>(false);
  /** Shake the field when it is blurred in an invalid state. */
  public readonly shakeOnInvalid = input<boolean>(true);
  public readonly showValidState = input<boolean>(true);
  public readonly clearLabel = input<string>('Clear');
  public readonly showPasswordLabel = input<string>('Show password');
  public readonly hidePasswordLabel = input<string>('Hide password');

  /* ── Outputs ── */
  public readonly valueChange = output<string>();
  public readonly focused = output<void>();
  public readonly blurred = output<void>();

  protected readonly value = signal('');
  protected readonly showPassword = signal(false);
  private readonly shakeRequests = signal(0);
  private readonly disabledByForm = signal(false);

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    // Assigning the accessor by hand instead of providing NG_VALUE_ACCESSOR keeps
    // NgControl injectable here; `useExisting: InputComponent` would otherwise make
    // FormControlDirective -> NgValueAccessor -> InputComponent a dependency cycle.
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  /** Mirrors the bound control so validity styling reacts without polling. */
  private readonly controlState = signal<ControlState | null>(null);

  protected readonly resolvedType = computed(() =>
    this.type() === 'password' && this.showPassword() ? 'text' : this.type(),
  );

  protected readonly isDisabledState = computed(() => this.isDisabled() || this.disabledByForm());

  protected readonly typeIcon = computed(() => TYPE_ICONS[this.type()]);

  protected readonly showClear = computed(
    () => this.clearable() && this.type() !== 'password' && this.value().length > 0,
  );

  protected readonly hasTrailingAction = computed(
    () => this.type() === 'password' || this.showClear(),
  );

  protected readonly hasStartIcon = computed(
    () => this.showIcon() && this.iconPosition() === 'start',
  );

  /**
   * A trailing action (eye / clear) always wins the end slot, so the decorative
   * icon steps aside instead of stacking on top of it.
   */
  protected readonly hasEndIcon = computed(
    () => this.showIcon() && this.iconPosition() === 'end' && !this.hasTrailingAction(),
  );

  protected readonly showInvalid = computed(() => {
    const state = this.controlState();
    return !!state && state.invalid && (state.touched || state.dirty);
  });

  protected readonly showValid = computed(() => {
    const state = this.controlState();
    return (
      !!state &&
      this.showValidState() &&
      state.valid &&
      (state.touched || state.dirty) &&
      !state.empty
    );
  });

  protected readonly describedBy = computed(() =>
    this.errorMessage() || this.hint() ? `${this.fieldId()}-msg` : null,
  );

  protected readonly shakeTarget = computed<TargetAndTransition>(() =>
    this.shakeRequests() > 0 ? { x: [...invalidFieldShake.x] } : invalidFieldRest,
  );

  protected readonly shakeTransition: Transition = invalidFieldTransition;
  protected readonly iconSwapTransition: Transition = {
    type: 'spring',
    stiffness: 420,
    damping: 24,
  };
  protected readonly clearTransition: Transition = { type: 'spring', stiffness: 500, damping: 26 };

  private readonly INPUT_BASE =
    'bg-surface-subtle border-border placeholder-muted text-ink h-12 w-full rounded-xl border-2 px-4 text-start text-base font-semibold transition-all focus:border-border-focus focus:shadow-[0_0_0_4px_rgba(var(--color-primary-rgb),0.10)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60';

  protected readonly mergedInputClasses = computed(() =>
    twMerge(
      this.INPUT_BASE,
      this.hasStartIcon() ? 'ps-10' : undefined,
      this.hasEndIcon() || this.hasTrailingAction() ? 'pe-10' : undefined,
      this.showInvalid() ? 'border-coral' : undefined,
      this.showValid() ? 'border-mint' : undefined,
      this.className(),
    ),
  );

  /** `NgControl.control` is only assigned in the control directive's
   *  `ngOnChanges`, so this cannot run from a field initializer. */
  public ngOnInit(): void {
    const control = this.ngControl?.control;

    if (!control) {
      return;
    }

    const snapshot = (): ControlState => ({
      invalid: control.invalid,
      valid: control.valid,
      touched: control.touched,
      dirty: control.dirty,
      empty: control.value === null || control.value === undefined || control.value === '',
    });

    this.controlState.set(snapshot());
    control.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.controlState.set(snapshot()));
  }

  public writeValue(value: unknown): void {
    this.value.set(value === null || value === undefined ? '' : String(value));
  }

  public registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabledByForm.set(isDisabled);
  }

  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const next = this.type() === 'tel' ? target.value.replace(DIGITS_ONLY, '') : target.value;

    if (next !== target.value) {
      target.value = next;
    }

    this.commit(next);
  }

  protected onBlur(): void {
    this.onTouched();

    if (this.shakeOnInvalid() && this.controlState()?.invalid) {
      this.shakeRequests.update((count) => count + 1);
    }

    this.blurred.emit();
  }

  protected clear(): void {
    this.commit('');
  }

  private commit(next: string): void {
    this.value.set(next);
    this.onChange(next);
    this.valueChange.emit(next);
  }
}
