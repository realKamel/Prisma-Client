import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AltOption } from '../../../../../../core/Models/lesson-expired';



@Component({
  selector: 'app-alt-options-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl:'./alt-options-card-component.html',
})
export class AltOptionsCardComponent {
  @Input() options: AltOption[] = [];
}