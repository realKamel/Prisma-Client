import { Component, output } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-lessons-toolbar',

  imports: [FormsModule, RouterModule],
  templateUrl: './lessons-toolbar-component.html',
})
export class LessonsToolbarComponent {
  readonly searchChange = output<string>();
  readonly statusChange = output<string>();

  searchQuery = '';
  statusFilter = 'all';

  onSearch(): void {
    this.searchChange.emit(this.searchQuery);
  }

  onStatusChange(): void {
    this.statusChange.emit(this.statusFilter);
  }
}
