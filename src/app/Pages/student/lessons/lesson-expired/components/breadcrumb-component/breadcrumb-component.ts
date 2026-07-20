import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BreadcrumbItem } from '../../../../../../core/Models/lesson-expired';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-breadcrumb',
  imports: [RouterModule, NgIcon],
  templateUrl: './breadcrumb-component.html',
})
export class BreadcrumbComponent {
  readonly items = input<BreadcrumbItem[]>([]);
}
