import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; // <-- Import Router
import { Lesson } from '../../../../core/Models/lesson-model';

@Component({
    selector: 'app-lesson-card',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './lesson-card.html',
    styleUrls: ['./lesson-card.css'],
})
export class LessonCardComponent {
    @Input({ required: true }) lesson!: Lesson;

    // Inject the Router
    constructor(private router: Router) { }

    // Method to navigate to the lesson details page
    navigateToLesson() {
        this.router.navigate(['/lesson', this.lesson.id]);
    }

    get statusLabel(): string {
        const map: Record<string, string> = {
            avail: 'متاح', purchased: 'مشتري', locked: 'مقفول', expired: 'منتهي الصلاحية',
        };
        return map[this.lesson.status] ?? '';
    }

    get ctaLabel(): string {
        const map: Record<string, string> = {
            avail: 'اشتري', purchased: 'ادخل الدرس', locked: '', expired: 'جدد',
        };
        return map[this.lesson.status] ?? '';
    }

    get durationDisplay(): string {
        const h = this.lesson.durationHours;
        return toArabicNumerals(h % 1 === 0 ? `${h}` : `${h}`) + ' ساعة';
    }
}

function toArabicNumerals(str: string): string {
    return str.replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);
}