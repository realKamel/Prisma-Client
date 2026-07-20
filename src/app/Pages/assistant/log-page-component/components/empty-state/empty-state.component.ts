import { Component } from '@angular/core';
import { bootstrapSearch } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';

@Component({
  selector: 'app-empty-state',
  imports: [NgIcon],
  templateUrl: './empty-state.component.html',
  viewProviders: [
    provideIcons({
      bootstrapSearch,
    }),
  ],
})
export class EmptyStateComponent {}
