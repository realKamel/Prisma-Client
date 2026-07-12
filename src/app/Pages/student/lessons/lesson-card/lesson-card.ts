import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
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

    constructor(private router: Router) { }

    navigateToLesson(): void {
        switch(this.lesson.status)
        {
            case 'avail':
                this.router.navigate(['/lessons', this.lesson.id, 'details']); break;
            case 'expired':
                this.router.navigate(['/lessons', this.lesson.id, 'expired']); break;
            case 'purchased':
                this.router.navigate(['/lessons', this.lesson.id, 'watch']); break;
            case 'locked':
                 break;
        }
    }

    get statusLabel(): string {
        const map: Record<string, string> = {
            avail: 'متاح',
            purchased: 'مشتري',
            locked: 'مقفول',
            expired: 'منتهي الصلاحية',
        };
        return map[this.lesson.status] ?? '';
    }

    get ctaLabel(): string {
        const map: Record<string, string> = {
            avail: 'اشتري',
            purchased: 'ادخل الدرس',
            locked: '',
            expired: 'جدد',
        };
        return map[this.lesson.status] ?? '';
    }

    get durationDisplay(): string {
        const h = this.lesson.durationHours;
        return toArabicNumerals(String(h)) + ' ساعة';
    }
    get showPrice(): boolean {
        return (
            this.lesson.status === 'avail' &&
            this.lesson.price !== null &&
            this.lesson.price !== undefined &&
            this.lesson.price > 0
        );
    }
}

function toArabicNumerals(str: string): string {
    return str.replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);
}