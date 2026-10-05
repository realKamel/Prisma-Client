import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { twMerge } from 'tailwind-merge';

/**
 * Reusable loading placeholder.
 *
 * ```html
 * <!-- default: a pulsing frosted card -->
 * <app-skeleton />
 *
 * <!-- reshaped into a text line -->
 * <app-skeleton className="h-4 w-40 rounded-full" />
 *
 * <!-- with a light sweep across it -->
 * <app-skeleton className="h-48 rounded-20" [shimmer]="true" />
 * ```
 */
@Component({
  selector: 'app-skeleton',
  imports: [TranslatePipe],
  host: {
    '[class]': 'mergedClasses()',
    role: 'status',
    'aria-busy': 'true',
  },
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.css',
})
export class SkeletonComponent {
  /**
   * Default shape: a frosted "loading card" — a translucent surface with a soft
   * backdrop blur, a hairline border and a gentle pulse.
   *
   * Every part of that is overridable through `className`. Classes are merged with
   * `tailwind-merge`, so the last class of a conflicting group wins (e.g. passing
   * `h-4 rounded-full` turns the card into a text line).
   */
  private readonly SKELETON_BASE =
    'relative block h-32 w-full overflow-hidden rounded-card border border-border bg-surface/70 backdrop-blur-md motion-safe:animate-pulse';

  /** Tailwind classes that define the skeleton's shape, merged over the defaults. */
  public readonly className = input<string>();

  /** Adds an animated light sweep over the skeleton (off by default). */
  public readonly shimmer = input(false);

  protected readonly mergedClasses = computed(() => twMerge(this.SKELETON_BASE, this.className()));
}
