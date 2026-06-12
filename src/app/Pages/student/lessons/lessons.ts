import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LessonService } from '../../../core/Services/lesson-service';
import { Lesson } from '../../../core/Models/lesson-model'; 
import { LessonCardComponent } from '../lessons/lesson-card/lesson-card'; 

// 1. Define the allowed keys
type FilterKey = 'all' | 'avail' | 'purchased' | 'locked' | 'expired';

@Component({
  selector: 'app-lessons',
  standalone: true,
  imports: [CommonModule, RouterModule, LessonCardComponent],
  templateUrl: './lessons.html',
  styleUrls: ['./lessons.css']
})
export class LessonsComponent implements OnInit {
  lessons: Lesson[] = [];
  filteredLessons: Lesson[] = [];
  isLoading = true;
  activeFilter: FilterKey = 'all';
  
  // 2. Type the counts object using the FilterKey
  counts: Record<FilterKey, number> = { all: 0, avail: 0, purchased: 0, locked: 0, expired: 0 };

  // 3. Type the filters array so 'key' is strictly a FilterKey
  filters: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'الكل' },
    { key: 'avail', label: 'متاح' },
    { key: 'purchased', label: 'مشتري' },
    { key: 'locked', label: 'مقفول' },
    { key: 'expired', label: 'منتهي' }
  ];

  constructor(private lessonService: LessonService) {}

  ngOnInit() {
    this.lessonService.getLessons().subscribe({
      next: (data) => {
        this.lessons = data;
        this.calculateCounts();
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching lessons', err);
        this.isLoading = false;
      }
    });
  }

  calculateCounts() {
    this.counts.all = this.lessons.length;
    this.counts.avail = this.lessons.filter(c => c.status === 'avail').length;
    this.counts.purchased = this.lessons.filter(c => c.status === 'purchased').length;
    this.counts.locked = this.lessons.filter(c => c.status === 'locked').length;
    this.counts.expired = this.lessons.filter(c => c.status === 'expired').length;
  }

  applyFilter() {
    this.filteredLessons = this.activeFilter === 'all' 
      ? this.lessons 
      : this.lessons.filter(c => c.status === this.activeFilter);
  }

  // 4. Update the parameter type here as well
  setFilter(filter: FilterKey) {
    this.activeFilter = filter;
    this.applyFilter();
  }
}