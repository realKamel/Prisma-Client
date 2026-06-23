import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { fileTypeLabel, fileTypeIconClasses } from '../file-helpers';
import { toAr } from '../to-ar (1)';
import { FileFilter, UploadedFile } from '../upload-page.types';


interface FilterChip {
  label: string;
  value: FileFilter;
}

@Component({
  selector: 'app-existing-files-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './existing-files-card-component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ExistingFilesCardComponent {
  @Input({ required: true }) allFiles!: UploadedFile[];
  @Input() activeFilter: FileFilter = 'all';

  @Output() filterChange = new EventEmitter<FileFilter>();
  @Output() delete = new EventEmitter<number>();

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
    return this.activeFilter === 'all'
      ? this.allFiles
      : this.allFiles.filter((file) => file.type === this.activeFilter);
  }
}