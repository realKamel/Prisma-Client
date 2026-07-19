import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { fileTypeLabel, fileTypeIconClasses } from '../file-helpers';
import { toAr } from '../../../../../core/pipes/to-ar (1)';
import { FileFilter, UploadedFile } from '../upload-page.types';

interface FilterChip {
  label: string;
  value: FileFilter;
}

@Component({
  selector: 'app-existing-files-card',
  imports: [],
  templateUrl: './existing-files-card-component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ExistingFilesCardComponent {
  readonly allFiles = input.required<UploadedFile[]>();
  readonly activeFilter = input<FileFilter>('all');

  readonly filterChange = output<FileFilter>();
  readonly delete = output<number>();

  readonly toAr = toAr;
  readonly fileTypeLabel = fileTypeLabel;
  readonly fileTypeIconClasses = fileTypeIconClasses;

  readonly filterChips: FilterChip[] = [
    { label: 'الكل', value: 'all' },
    { label: 'PDF', value: 'pdf' },
    { label: 'فيديو', value: 'vid' },
    { label: 'عروض', value: 'ppt' },
  ];

  get filteredFiles(): UploadedFile[] {
    return this.activeFilter() === 'all'
      ? this.allFiles()
      : this.allFiles().filter((file) => file.type === this.activeFilter());
  }
}
