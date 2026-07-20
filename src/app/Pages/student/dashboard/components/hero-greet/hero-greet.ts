import { Component, OnInit, input } from '@angular/core';

import { StudentDto, StreakDto } from '../../../../../core/Models/Student/Dashboard.Models';
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideFlame } from '@ng-icons/lucide';

interface WeekDay {
  label: string;
  done: boolean;
  isToday: boolean;
}

@Component({
  selector: 'app-hero-greet',
  templateUrl: './hero-greet.html',
  imports: [NgIcon],
  viewProviders: [provideIcons({lucideFlame})]
})
export class HeroGreet implements OnInit {
  readonly student = input.required<StudentDto>();

  readonly streak = input.required<StreakDto>();

  weekDays: WeekDay[] = [];

  private readonly DAY_NAMES = [
    'السبت',
    'الأحد',
    'الاثنين',
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
    'الجمعة',
  ];

  ngOnInit(): void {
    this.weekDays = this.buildWeekDays();
  }

  /**
   * Derives the 7-day streak display from today's date + streak count.
   * Week starts on Saturday. Today is always shown; days before today
   * within the streak count are marked done.
   */
  private buildWeekDays(): WeekDay[] {
    const today = new Date();
    // getDay(): 0=Sun … 6=Sat  →  map to Saturday-first index
    const todayIndexInWeek = (today.getDay() + 1) % 7; // Sat=0 … Fri=6

    return this.DAY_NAMES.map((label, i) => {
      const isToday = i === todayIndexInWeek;
      const daysAgo = todayIndexInWeek - i; // negative means future
      const done = daysAgo >= 0 && daysAgo < this.streak().count;
      return { label, done, isToday };
    });
  }
}
