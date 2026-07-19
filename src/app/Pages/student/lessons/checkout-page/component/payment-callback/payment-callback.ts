import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-payment-callback',
  imports: [RouterLink],
  templateUrl: './payment-callback.html',
})
export class PaymentCallback implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Core State Signals
  readonly state = signal<'success' | 'failed'>('failed');
  readonly transactionId = signal<string>('');

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    const success = params['success'] === 'true';

    this.transactionId.set(params['id'] ?? '');
    this.state.set(success ? 'success' : 'failed');
  }

  goToLesson(): void {
    const stored = sessionStorage.getItem('currentLesson');
    if (stored) {
      try {
        const lesson = JSON.parse(stored);
        this.router.navigate(['/lessons', lesson.id, 'watch']);
      } catch {
        this.router.navigate(['/home']);
      }
    } else {
      this.router.navigate(['/home']);
    }
  }
}
