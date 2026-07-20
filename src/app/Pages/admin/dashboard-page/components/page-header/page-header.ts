import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { bootstrapPeopleFill } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.html',
  imports: [RouterLink, NgIcon],
  viewProviders: [
    provideIcons({
      bootstrapPeopleFill,
    }),
  ],
})
export class PageHeader {
  readonly pageDateLabel = input.required<string>();
}
