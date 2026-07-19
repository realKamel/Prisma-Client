import { Component, input } from '@angular/core';

import { Material } from '../../../../../../core/Models/Lesson/Lesson-Player';

@Component({
  selector: 'app-materials-tab',

  imports: [],
  templateUrl: './materials-tab.html',
})
export class MaterialsTab {
  readonly materialsList = input<Material[]>([]);
}
