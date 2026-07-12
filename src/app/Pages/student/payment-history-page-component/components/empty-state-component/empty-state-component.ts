import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './empty-state-component.html',
})
export class EmptyStateComponent {}