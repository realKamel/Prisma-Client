import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface Review {
  stars: string;
  body: string;
  avatar: string;
  name: string;
  role: string;
}

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonials.html'
})
export class Testimonials implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  reviews: Review[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Review[]>('data/reviews.json').subscribe({

      next: (data) => {this.reviews = data ; this.cdr.detectChanges()},
       

      error: (err) => console.error('Failed to load reviews:', err)
    });
  }
}