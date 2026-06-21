import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-lessons-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './lessons-toolbar-component.html',
})
export class LessonsToolbarComponent {
  @Output() searchChange  = new EventEmitter<string>();
  @Output() statusChange  = new EventEmitter<string>();

  searchQuery = '';
  statusFilter = 'all';

  onSearch(): void {
    this.searchChange.emit(this.searchQuery);
  }

  onStatusChange(): void {
    this.statusChange.emit(this.statusFilter);
  }
}