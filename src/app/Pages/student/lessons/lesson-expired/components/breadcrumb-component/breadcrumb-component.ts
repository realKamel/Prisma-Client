import { Component, input } from '@angular/core';

import { RouterModule } from '@angular/router';
import { BreadcrumbItem } from '../../../../../../core/Models/lesson-expired';

@Component({
  selector: 'app-breadcrumb',

  imports: [RouterModule],
  templateUrl: './breadcrumb-component.html',
})
export class BreadcrumbComponent {
  readonly items = input<BreadcrumbItem[]>([]);
}
