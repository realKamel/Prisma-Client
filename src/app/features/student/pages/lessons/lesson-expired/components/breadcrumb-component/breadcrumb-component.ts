import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { BreadcrumbItem } from '../../../../../../../domain/lessons/models/lesson-expired';

@Component({
  selector: 'app-breadcrumb',
  imports: [RouterModule, NgIcon],
  templateUrl: './breadcrumb-component.html',
})
export class BreadcrumbComponent {
  public readonly items = input<BreadcrumbItem[]>([]);
}
