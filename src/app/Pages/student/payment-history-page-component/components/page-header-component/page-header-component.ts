import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './page-header-component.html',
})
export class PageHeaderComponent {
  readonly eyebrow = input('');
  readonly titleMain = input('');
  readonly titleAccent = input('');
  readonly subtitle = input('');
}