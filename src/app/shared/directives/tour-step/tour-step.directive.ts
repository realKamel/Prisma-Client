import { Directive, input } from '@angular/core';

@Directive({
  selector: '[appTourStep]',
  host: {
    '[attr.data-tour-step]': 'appTourStep()',
  },
})
export class TourStepDirective {
  readonly appTourStep = input.required<string>();
}