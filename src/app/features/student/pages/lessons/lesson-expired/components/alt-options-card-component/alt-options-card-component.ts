import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AltOption } from '../../../../../../../core/Models/lesson-expired';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapChevronLeft,
  bootstrapMortarboard,
  bootstrapCurrencyDollar,
  bootstrapChatDots,
} from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-alt-options-card',
  imports: [RouterModule, NgIcon],
  templateUrl: './alt-options-card-component.html',
  viewProviders: [
    provideIcons({
      bootstrapChevronLeft,
      bootstrapMortarboard,
      bootstrapCurrencyDollar,
      bootstrapChatDots,
    }),
  ],
})
export class AltOptionsCardComponent {
  readonly options = input<AltOption[]>([]);
}
