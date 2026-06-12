import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; // <-- Import Router
import { Course } from '../../../../core/Models/course.model';

@Component({
    selector: 'app-course-card',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './course-card.html',
    styleUrls: ['./course-card.css'],
})
export class CourseCardComponent {
    @Input({ required: true }) course!: Course;

    // Inject the Router
    constructor(private router: Router) { }

    // Method to navigate to the course details page
    navigateToCourse() {
        this.router.navigate(['/course', this.course.id]);
    }

    get statusLabel(): string {
        const map: Record<string, string> = {
            avail: 'متاح', purchased: 'مشتري', locked: 'مقفول', expired: 'منتهي الصلاحية',
        };
        return map[this.course.status] ?? '';
    }

    get ctaLabel(): string {
        const map: Record<string, string> = {
            avail: 'اشتري', purchased: 'ادخل الدرس', locked: '', expired: 'جدد',
        };
        return map[this.course.status] ?? '';
    }

    get durationDisplay(): string {
        const h = this.course.durationHours;
        return toArabicNumerals(h % 1 === 0 ? `${h}` : `${h}`) + ' ساعة';
    }
}

function toArabicNumerals(str: string): string {
    return str.replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);
}