import { Component, model, output } from '@angular/core';
import { bootstrapSearch } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { SearchInputComponent } from '../../../../../shared/components/search-input/search-input.component';

type ExportState = 'idle' | 'exporting' | 'done';

@Component({
  selector: 'app-log-toolbar',
  imports: [NgIcon, SearchInputComponent],
  templateUrl: './log-toolbar.component.html',
  viewProviders: [
    provideIcons({
      bootstrapSearch,
    }),
  ],
})
export class LogToolbarComponent {
  readonly searchContent = model<string>();
  // readonly searchContent = model<string>();
  exportState: ExportState = 'idle';

  onExportClick(): void {
    if (this.exportState !== 'idle') return;
    this.exportState = 'exporting';
    setTimeout(() => {
      this.exportState = 'done';
      setTimeout(() => (this.exportState = 'idle'), 2000);
    }, 1200);
  }
}
