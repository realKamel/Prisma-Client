import { Component } from '@angular/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';

/**
 * Page header shared by every tab of the grading section.
 *
 * The tabs themselves are navigated from the staff sidebar (the `grading` nav
 * item's children), so each page renders the same title block above its panel.
 */
@Component({
  selector: 'app-grading-header',
  imports: [NgmMotionDirective],
  templateUrl: './grading-header.html',
  host: { class: 'block' },
})
export class GradingHeaderComponent {}
