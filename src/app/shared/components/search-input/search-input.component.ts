import { Component, computed, debounced, effect, input, model, signal } from '@angular/core';
import { bootstrapSearch, bootstrapX } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { twMerge } from 'tailwind-merge';

@Component({
  selector: 'app-search-input',
  imports: [NgIcon, NgmMotionDirective],
  templateUrl: './search-input.component.html',
  viewProviders: [
    provideIcons({
      bootstrapSearch,
      bootstrapX,
    }),
  ],
})
export class SearchInputComponent {
  public readonly placeholder = input<string>('');
  public readonly className = input<string>(
    'w-full h-11 bg-surface-subtle border border-border rounded-card text-sm text-ink placeholder:text-muted focus:outline-none focus:border-primary transition-colors disabled:cursor-not-allowed disabled:opacity-60',
  );

  public readonly debounceTime = input<number>(300);

  protected readonly query = signal('');

  private readonly debouncedQuery = debounced(this.query, this.debounceTime());

  public readonly content = model<string | undefined>();
  public readonly disabled = input<boolean | undefined>();

  constructor() {
    effect(() => {
      if (this.debouncedQuery.status() === 'resolved') {
        this.content.set(this.debouncedQuery.value());
      }
    });
  }

  protected readonly mergedClasses = computed(() => twMerge(this.className(), 'ps-10 pe-10'));

  protected processInput(value: string): void {
    this.query.set(value);
  }

  protected clearSearch(): void {
    this.query.set('');
    this.content.set('');
  }
}
