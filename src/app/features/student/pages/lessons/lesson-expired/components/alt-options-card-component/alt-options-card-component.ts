import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  bootstrapChatDots,
  bootstrapChevronLeft,
  bootstrapCurrencyDollar,
  bootstrapMortarboard,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { AltOption } from '../../../../../../../core/models/lesson-expired';

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
  public readonly options = input<AltOption[]>([]);
}
