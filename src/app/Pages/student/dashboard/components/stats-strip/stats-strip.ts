// dashboard/components/stats-strip/stats-strip.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountUpDirective } from '../../directives/count-up.directive';
import { StatsDto } from '../../../../../core/Models/Student/Dashboard.Models';

@Component({
  selector: 'app-stats-strip',
  standalone: true,
  imports: [CommonModule, CountUpDirective],
  templateUrl: './stats-strip.html',
})
export class StatsStrip {
  @Input({ required: true }) stats!: StatsDto;
}