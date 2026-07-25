import { Component, input } from '@angular/core';
import { Material, Section } from '../../../../../../../core/Models/Lesson/Lesson-Player';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapBullseye, bootstrapCalculator } from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-about-tab',
  imports: [NgIcon],
  templateUrl: './about-tab.html',
  viewProviders: [
    provideIcons({
      bootstrapBullseye,
      bootstrapCalculator,
    }),
  ],
})
export class AboutTab {
  // استقبال البيانات الممررة من المكوّن الأب
  readonly description = input<string>();
  readonly sections = input<Section[]>();
  readonly materials = input<Material[]>();
  readonly objectives = input<string[]>();
}
