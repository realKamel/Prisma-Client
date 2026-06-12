import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CourseService } from '../../../core/Services/course-service';
import { Course } from '../../../core/Models/course.model'; 
import { CourseCardComponent } from '../courses/course-card/course-card'; 

// 1. Define the allowed keys
type FilterKey = 'all' | 'avail' | 'purchased' | 'locked' | 'expired';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, RouterModule, CourseCardComponent],
  templateUrl: './courses.html',
  styleUrls: ['./courses.css']
})
export class CoursesComponent implements OnInit {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
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

  constructor(private courseService: CourseService) {}

  ngOnInit() {
    this.courseService.getCourses().subscribe({
      next: (data) => {
        this.courses = data;
        this.calculateCounts();
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching courses', err);
        this.isLoading = false;
      }
    });
  }

  calculateCounts() {
    this.counts.all = this.courses.length;
    this.counts.avail = this.courses.filter(c => c.status === 'avail').length;
    this.counts.purchased = this.courses.filter(c => c.status === 'purchased').length;
    this.counts.locked = this.courses.filter(c => c.status === 'locked').length;
    this.counts.expired = this.courses.filter(c => c.status === 'expired').length;
  }

  applyFilter() {
    this.filteredCourses = this.activeFilter === 'all' 
      ? this.courses 
      : this.courses.filter(c => c.status === this.activeFilter);
  }

  // 4. Update the parameter type here as well
  setFilter(filter: FilterKey) {
    this.activeFilter = filter;
    this.applyFilter();
  }
}