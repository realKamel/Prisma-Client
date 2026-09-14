import { Component, computed, input, model, signal } from '@angular/core';
import { bootstrapSearch, bootstrapX } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { twMerge } from 'tailwind-merge';

@Component({
  selector: 'app-search-input',
  imports: [NgIcon, NgmMotionDirective],
  template: `
    <div class="relative w-full">
      <ng-icon
        name="bootstrapSearch"
        class="absolute inset-s-3 top-1/2 -translate-y-1/2 text-lg text-gray-400 pointer-events-none z-10"
      />

      <input
        type="text"
        #searchInput
        [placeholder]="placeholder()"
        [class]="mergedClasses()"
        (input)="processInput(searchInput.value)"
      />

      @if (input()) {
        <button
          type="button"
          (click)="clearSearch(searchInput)"
          ngmMotion
          [initial]="{ opacity: 0, scale: 0.7 }"
          [animate]="{ opacity: 1, scale: 1 }"
          [exit]="{ opacity: 0, scale: 0.7 }"
          [whileHover]="{ scale: 1.1 }"
          [whileTap]="{ scale: 0.9 }"
          [transition]="{ type: 'spring', stiffness: 400, damping: 24 }"
          aria-label="Clear search"
          class="absolute inset-e-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-2xl text-gray-400 hover:text-gray-600 focus:outline-none z-10 cursor-pointer"
        >
          <ng-icon name="bootstrapX" />
        </button>
      }
    </div>
  `,
  viewProviders: [
    provideIcons({
      bootstrapSearch,
      bootstrapX,
    }),
  ],
})
export class SearchInputComponent {
  readonly placeholder = input<string>('');
  readonly className = input<string>(
    'w-full h-11 bg-surface-subtle border border-border rounded-xl text-sm text-ink placeholder:text-muted focus:outline-none focus:border-primary transition-colors',
  );

  readonly input = signal('');
  readonly content = model<string | undefined>();

  // Protect internal icon clearance padding (ps-10 pe-10) against consumer class overrides
  readonly mergedClasses = computed(() => twMerge(this.className(), 'ps-10 pe-10'));

  processInput(value: string): void {
    this.input.set(value);
    this.content.set(value);
  }

  clearSearch(inputElement: HTMLInputElement): void {
    inputElement.value = '';
    this.processInput('');
  }
}
