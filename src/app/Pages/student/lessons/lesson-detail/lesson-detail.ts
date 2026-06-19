import { Component, OnInit, signal, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router'; // استيراد الـ Router
import { LessonService } from '../../../../core/Services/lesson.service';
import { LessonResponse } from '../../../../core/Models/lesson.model';
import { LessonPriceCardComponent } from './components/lesson-price-card-component/lesson-price-card-component';
import { LessonChaptersComponent } from './components/lesson-chapters-component/lesson-chapters-component';
import { LessonPrerequisitesComponent } from './components/lesson-prerequisites-component/lesson-prerequisites-component';
import { LessonOutcomesComponent } from './components/lesson-outcomes-component/lesson-outcomes-component';
import { LessonAboutComponent } from './components/lesson-about-component/lesson-about-component';
import { LessonHeroComponent } from './components/lesson-hero/lesson-hero';

@Component({
  selector: 'app-lesson-detail',
  standalone: true,
  imports: [
    CommonModule,
    LessonHeroComponent,
    LessonAboutComponent,
    LessonOutcomesComponent,
    LessonPrerequisitesComponent,
    LessonChaptersComponent,
    LessonPriceCardComponent,
    RouterLink
],
  templateUrl: './lesson-detail.html'
})
export class LessonDetailComponent implements OnInit {
  private lessonService = inject(LessonService);
  private router = inject(Router); // حقن الراوتر
  
  public lessonData = signal<LessonResponse | null>(null);
  public isLoading = signal<boolean>(true);
  public hasError = signal<boolean>(false);
  @Input() id!: string; 

  ngOnInit(): void {
    this.fetchLessonDetails();
  }

  private fetchLessonDetails(): void {
    this.lessonService.getLessonDetails(this.id).subscribe({
      next: (res) => {
        // تأكد من تطابق الهيكل مع الـ API لديك (res.data أو res مباشرة)
        this.lessonData.set(res.data); 
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error:', err);
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  public buyNow(): void {
    const data = this.lessonData();
          this.lessonService.currentLesson = data;     
      this.router.navigate([`/lessons/${data?.id}/checkout`]);
  }
  
  public RedeemWithCode(): void {
    const data = this.lessonData();
          this.lessonService.currentLesson = data;     
      this.router.navigate([`/lessons/${data?.id}/redeem`]);
  }
}