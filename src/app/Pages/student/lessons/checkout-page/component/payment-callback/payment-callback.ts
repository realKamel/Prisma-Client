// payment-callback/payment-callback.component.ts
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-payment-callback',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-callback.html'
})
export class PaymentCallback implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  public state: 'success' | 'failed' = 'failed';
  public transactionId = '';

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    const success = params['success'] === 'true';
    this.transactionId = params['id'] ?? '';
    this.state = success ? 'success' : 'failed';
    this.cdr.markForCheck();
  }

  goToLesson(): void {
    // navigate to the lesson — grab lessonId from sessionStorage
    const stored = sessionStorage.getItem('currentLesson');
    if (stored) {
      const lesson = JSON.parse(stored);
      this.router.navigate(['/lessons', lesson.id, 'watch']);
    } else {
      this.router.navigate(['/home']);
    }
  }
}