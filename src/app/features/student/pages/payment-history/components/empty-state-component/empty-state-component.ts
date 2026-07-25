import { Component } from '@angular/core';
import { bootstrapWallet2 } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';

@Component({
  selector: 'app-empty-state',
  imports: [NgIcon],
  viewProviders: [
    provideIcons({
      bootstrapWallet2,
    }),
  ],
  templateUrl: './empty-state-component.html',
})
export class EmptyStateComponent {}
