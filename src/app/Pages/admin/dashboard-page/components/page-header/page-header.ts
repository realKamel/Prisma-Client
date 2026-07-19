import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.html',
  imports: [RouterLink],
})
export class PageHeader {
  readonly pageDateLabel = input.required<string>();
}
