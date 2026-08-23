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
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapPersonFill,
  bootstrapMortarboardFill,
  bootstrapBookFill,
  bootstrapArrowLeft,
  bootstrapAwardFill,
  bootstrapCalendarCheck,
  bootstrapChevronDown,
  bootstrapPersonVideo3,
} from '@ng-icons/bootstrap-icons';
import { Teacher } from '../../../../../../core/Models/Student/teacher.model';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Dumb / presentational teacher card.
 * Receives a `Teacher` via input, emits `viewProfile` on CTA click.
 * Holds no state and knows nothing about the API or routing.
 */
@Component({
  selector: 'app-teacher-card',
  imports: [NgIcon, TranslatePipe],
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
  readonly teacher = input.required<Teacher>();
  readonly viewProfile = output<Teacher>();
  readonly viewLessons = output<Teacher>();
  readonly isLoggedIn = input<boolean>(false);

  protected readonly fullName = computed(
    () => `${this.teacher().firstName} ${this.teacher().secondName}`,
  );

  protected readonly open = signal(false);

  protected readonly academicYearsCount = computed(() => this.teacher().academicYears?.length ?? 0);

  protected readonly academicYearsLabel = computed(() => {
    const n = this.academicYearsCount();
    return n === 1 ? 'سنة دراسية واحدة' : `${n} سنوات دراسية`;
  });

  readonly yearsTrigger = viewChild<ElementRef<HTMLButtonElement>>('yearsTrigger');
  readonly yearsPopover = viewChild<ElementRef<HTMLDivElement>>('yearsPopover');

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

  togglePopover(): void {
    if (this.open()) {
      this.closePopover();
    } else {
      this.openPopover();
    }
  }

  private openPopover(): void {
    this.open.set(true);
    // Move focus into the panel (tabindex="-1") for keyboard users.
    requestAnimationFrame(() => this.yearsPopover()?.nativeElement.focus());
  }

  closePopover(): void {
    if (!this.open()) return;
    this.open.set(false);
    this.yearsTrigger()?.nativeElement.focus();
  }

  onViewProfile(): void {
    this.viewProfile.emit(this.teacher());
  }

  onViewLessons(): void {
    this.viewLessons.emit(this.teacher());
  }
}
