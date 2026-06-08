import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Testimonial } from '../Models/Testimonial';

@Injectable({
  providedIn: 'root',
})
export class TestimonialService {
  private http = inject(HttpClient);
  getStatus(): Observable<Testimonial[]> {
    return this.http.get<Testimonial[]>('');
  }
}
