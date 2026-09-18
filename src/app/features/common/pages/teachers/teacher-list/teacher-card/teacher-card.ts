import {
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  bootstrapArrowLeft,
  bootstrapAwardFill,
  bootstrapBookFill,
  bootstrapCalendarCheck,
  bootstrapChevronDown,
  bootstrapMortarboardFill,
  bootstrapPersonFill,
  bootstrapPersonVideo3,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { TranslatePipe } from '@ngx-translate/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { Teacher } from '../../../../../../core/Models/Student/teacher.model';

/**
 * Dumb / presentational teacher card.
 * Receives a `Teacher` via input, emits `viewProfile` on CTA click.
 * Holds no state and knows nothing about the API or routing.
 */
@Component({
  selector: 'app-teacher-card',
  imports: [NgIcon, TranslatePipe, NgmMotionDirective],
  viewProviders: [
    provideIcons({
      bootstrapPersonFill,
      bootstrapMortarboardFill,
      bootstrapBookFill,
      bootstrapArrowLeft,
      bootstrapAwardFill,
      bootstrapCalendarCheck,
      bootstrapChevronDown,
      bootstrapPersonVideo3,
    }),
  ],
  templateUrl: './teacher-card.html',
  styleUrls: ['./teacher-card.css'],
})
export class TeacherCardComponent {
  public readonly teacher = input.required<Teacher>();
  public readonly viewProfile = output<Teacher>();
  public readonly viewLessons = output<Teacher>();
  public readonly isLoggedIn = input<boolean>(false);

  protected readonly fullName = computed(
    () => `${this.teacher().firstName} ${this.teacher().secondName}`,
  );

  protected readonly open = signal(false);

  protected readonly academicYearsCount = computed(() => this.teacher().academicYears?.length ?? 0);

  protected readonly academicYearsLabel = computed(() => {
    const n = this.academicYearsCount();
    return n === 1 ? 'سنة دراسية واحدة' : `${n} سنوات دراسية`;
  });

  protected readonly yearsTrigger = viewChild<ElementRef<HTMLButtonElement>>('yearsTrigger');
  protected readonly yearsPopover = viewChild<ElementRef<HTMLDivElement>>('yearsPopover');

  private readonly host = inject(ElementRef<HTMLElement>);

  /** Closes the popover when a click lands outside the card. */
  private readonly onDocClick = (event: Event): void => {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.closePopover();
    }
  };

  constructor() {
    document.addEventListener('click', this.onDocClick);
    inject(DestroyRef).onDestroy(() => document.removeEventListener('click', this.onDocClick));
  }

  protected togglePopover(): void {
    if (this.open()) {
      this.closePopover();
    } else {
      this.openPopover();
    }
  }

  protected onCardClick(event: MouseEvent): void {
    const target = event.target;
    const interactiveTarget =
      target instanceof HTMLElement ? target.closest('button, a, input, [role="button"]') : null;
    if (interactiveTarget && interactiveTarget !== event.currentTarget) {
      return;
    }

    this.togglePopover();
  }

  protected onCardKeydown(event: Event): void {
    if (event.target !== event.currentTarget) return;
    event.preventDefault();
    this.togglePopover();
  }

  private openPopover(): void {
    this.open.set(true);
    // Move focus into the panel (tabindex="-1") for keyboard users.
    requestAnimationFrame(() => this.yearsPopover()?.nativeElement.focus());
  }

  protected closePopover(): void {
    if (!this.open()) return;
    this.open.set(false);
    this.yearsTrigger()?.nativeElement.focus();
  }

  protected onViewProfile(): void {
    this.viewProfile.emit(this.teacher());
  }

  protected onViewLessons(): void {
    this.viewLessons.emit(this.teacher());
  }
}
