import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header-component.html',
})
export class PageHeaderComponent {
  readonly eyebrow = input('');
  readonly titleMain = input('');
  readonly titleAccent = input('');
  readonly subtitle = input('');
}
