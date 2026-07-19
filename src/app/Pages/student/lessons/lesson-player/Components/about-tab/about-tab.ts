import { Component, input } from '@angular/core';

import { Material, Section } from '../../../../../../core/Models/Lesson/Lesson-Player';

@Component({
  selector: 'app-about-tab',

  imports: [],
  templateUrl: './about-tab.html',
})
export class AboutTab {
  // استقبال البيانات الممررة من المكوّن الأب
  readonly description = input<string>();
  readonly sections = input<Section[]>();
  readonly materials = input<Material[]>();
  readonly objectives = input<string[]>();
}
