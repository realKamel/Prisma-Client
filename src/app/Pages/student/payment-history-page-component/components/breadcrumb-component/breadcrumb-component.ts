import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './breadcrumb-component.html',
})
export class BreadcrumbComponent {
  readonly items = input.required<BreadcrumbItem[]>();
}