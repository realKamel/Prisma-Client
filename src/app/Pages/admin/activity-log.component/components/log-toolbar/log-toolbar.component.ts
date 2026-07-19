import { Component, inject, output } from '@angular/core';

type ExportState = 'idle' | 'exporting' | 'done';

@Component({
  selector: 'app-log-toolbar',
  templateUrl: './log-toolbar.component.html',
})
export class LogToolbarComponent {
  readonly searchChange = output<string>();

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
