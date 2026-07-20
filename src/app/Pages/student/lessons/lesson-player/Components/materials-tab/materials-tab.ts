import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Material } from '../../../../../../core/Models/Lesson/Lesson-Player';

@Component({
  selector: 'app-materials-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './materials-tab.html'
})
export class MaterialsTab {
  @Input() materialsList: Material[] = [];
}