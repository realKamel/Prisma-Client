import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, input } from '@angular/core';
import { bootstrapLightningCharge } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { LessonService } from '../../../../../../../core/Services/lesson.service';
import { DurationPipe } from '../../../../../../../core/pipes/duration-pipe/duration-pipe';

@Component({
  selector: 'app-lesson-context',
  imports: [NgIcon, CurrencyPipe , DurationPipe],
  templateUrl: './lesson-context-component.html',
  viewProviders: [
    provideIcons({
      bootstrapLightningCharge,
    }),
  ],
})
export class LessonContextComponent implements OnInit {
  private readonly lessonService = inject(LessonService);
  // readonly id = input.required<string>();
  public readonly id = input.required<string>();
  protected readonly lesson = computed(() => this.lessonService.currentLesson());
  public ngOnInit() {
    if (!this.lessonService.currentLesson()) {
      this.lessonService.getLessonDetails(this.id()).subscribe();
    }
  }
}
