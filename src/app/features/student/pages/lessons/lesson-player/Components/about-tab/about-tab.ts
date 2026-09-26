import { Component, input } from '@angular/core';
import { bootstrapBullseye, bootstrapCalculator } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Material, Section } from '../../../../../../../core/Models/Lesson/Lesson-Player';

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
export class AboutTabComponent {
  public readonly description = input<string>();
  public readonly sections = input<Section[]>();
  public readonly materials = input<Material[]>();
  public readonly objectives = input<string[]>();
}
