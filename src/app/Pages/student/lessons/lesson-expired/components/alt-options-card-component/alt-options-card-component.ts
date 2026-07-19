import { Component, input } from '@angular/core';

import { RouterModule } from '@angular/router';
import { AltOption } from '../../../../../../core/Models/lesson-expired';

@Component({
  selector: 'app-alt-options-card',

  imports: [RouterModule],
  templateUrl: './alt-options-card-component.html',
})
export class AltOptionsCardComponent {
  readonly options = input<AltOption[]>([]);
}
