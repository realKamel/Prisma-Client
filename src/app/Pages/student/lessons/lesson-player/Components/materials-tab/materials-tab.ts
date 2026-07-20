import { Component, input } from '@angular/core';

import { Material } from '../../../../../../core/Models/Lesson/Lesson-Player';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapDownload,
  bootstrapFileEarmarkCheckFill,
  bootstrapFileEarmarkPdfFill,
  bootstrapFileEarmarkPptFill,
  bootstrapFolderX,
} from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-materials-tab',
  imports: [NgIcon],
  templateUrl: './materials-tab.html',
  viewProviders: [
    provideIcons({
      bootstrapFileEarmarkPdfFill,
      bootstrapFileEarmarkPptFill,
      bootstrapFileEarmarkCheckFill,
      bootstrapDownload,
      bootstrapFolderX,
    }),
  ],
})
export class MaterialsTab {
  readonly materialsList = input<Material[]>([]);
}
