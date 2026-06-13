import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LessonService } from '../../../core/Services/lesson-service';
import { Lesson } from '../../../core/Models/lesson-model';
import { LessonCardComponent } from '../lessons/lesson-card/lesson-card';

type FilterKey = 'all' | 'avail' | 'purchased' | 'locked' | 'expired';

@Component({
  selector: 'app-lessons',
  standalone: true,
  imports: [CommonModule, RouterModule, LessonCardComponent],
  templateUrl: './lessons.html',
  styleUrls: ['./lessons.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,  
})
export class LessonsComponent implements OnInit {

  lessons:         Lesson[]   = [];
  filteredLessons: Lesson[]   = [];
  isLoading                   = true;
  activeFilter: FilterKey     = 'all';

  counts: Record<FilterKey, number> = {
    all: 0, avail: 0, purchased: 0, locked: 0, expired: 0,
  };

  filters: { key: FilterKey; label: string }[] = [
    { key: 'all',       label: 'الكل'           },
    { key: 'avail',     label: 'متاح'            },
    { key: 'purchased', label: 'مشتري'           },
    { key: 'locked',    label: 'مقفول'           },
    { key: 'expired',   label: 'منتهي الصلاحية' },
  ];

  constructor(
    private lessonService: LessonService,
    private cdr: ChangeDetectorRef,     
  ) {}

  ngOnInit(): void {
    this.lessonService.getLessons().subscribe({
      next: (data) => {
        this.lessons = data ?? [];
        this.calculateCounts();
        this.applyFilter();
        this.isLoading = false;
        this.cdr.markForCheck();      
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();        
      },
    });
  }

  calculateCounts(): void {
    this.counts = {
      all:       this.lessons.length,
      avail:     this.lessons.filter(l => l.status === 'avail').length,
      purchased: this.lessons.filter(l => l.status === 'purchased').length,
      locked:    this.lessons.filter(l => l.status === 'locked').length,
      expired:   this.lessons.filter(l => l.status === 'expired').length,
    };
  }

  applyFilter(): void {
    this.filteredLessons = this.activeFilter === 'all'
      ? [...this.lessons]
      : this.lessons.filter(l => l.status === this.activeFilter);
  }

  setFilter(filter: FilterKey): void {
    this.activeFilter = filter;
    this.applyFilter();
    this.cdr.markForCheck();             
  }
}