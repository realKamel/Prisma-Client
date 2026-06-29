import { Component, EventEmitter, Output } from '@angular/core';

type ExportState = 'idle' | 'exporting' | 'done';

@Component({
  selector: 'app-log-toolbar',
  standalone: true,
  templateUrl: './log-toolbar.component.html',
})
export class LogToolbarComponent {
  @Output() searchChange = new EventEmitter<string>();

  exportState: ExportState = 'idle';

  onSearchInput(value: string): void {
    this.searchChange.emit(value);
  }

  onExportClick(): void {
    if (this.exportState !== 'idle') return;
    this.exportState = 'exporting';
    setTimeout(() => {
      this.exportState = 'done';
      setTimeout(() => (this.exportState = 'idle'), 2000);
    }, 1200);
  }
}
