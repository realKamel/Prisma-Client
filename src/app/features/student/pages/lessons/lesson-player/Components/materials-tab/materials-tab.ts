import { Component, input } from '@angular/core';
import {
  bootstrapDownload,
  bootstrapFileEarmarkCheckFill,
  bootstrapFileEarmarkPdfFill,
  bootstrapFileEarmarkPptFill,
  bootstrapFolderX,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Material } from '../../../../../../../core/Models/Lesson/Lesson-Player';

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
export class MaterialsTabComponent {
  public readonly materialsList = input<Material[]>([]);
}
