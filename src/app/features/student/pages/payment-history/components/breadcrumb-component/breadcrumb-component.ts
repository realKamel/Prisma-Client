import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Breadcrumb } from '../../../../../../shared/models/navigation.model';

@Component({
  selector: 'app-breadcrumb',
  imports: [RouterLink],
  templateUrl: './breadcrumb-component.html',
})
export class BreadcrumbComponent {
  readonly items = input.required<Breadcrumb[]>();
}
