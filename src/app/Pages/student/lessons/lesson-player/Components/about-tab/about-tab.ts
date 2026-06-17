import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Material, Section } from '../../../../../../core/Models/Lesson/Lesson-Player';


@Component({
  selector: 'app-about-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-tab.html'
})
export class AboutTab {
  // استقبال البيانات الممررة من المكوّن الأب
  @Input() description!: string;
  @Input() sections!: Section[];
  @Input() materials!: Material[];
  @Input() objectives!: string[];
}