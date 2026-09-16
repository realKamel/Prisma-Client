import { Component, computed, input, model, signal } from '@angular/core';
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
    'w-full h-11 bg-surface-subtle border border-border rounded-xl text-sm text-ink placeholder:text-muted focus:outline-none focus:border-primary transition-colors',
  );

  protected readonly input = signal('');
  public readonly content = model<string | undefined>();

  // Protect internal icon clearance padding (ps-10 pe-10) against consumer class overrides
  protected readonly mergedClasses = computed(() => twMerge(this.className(), 'ps-10 pe-10'));

  protected processInput(value: string): void {
    this.input.set(value);
    this.content.set(value);
  }

  protected clearSearch(inputElement: HTMLInputElement): void {
    inputElement.value = '';
    this.processInput('');
  }
}
