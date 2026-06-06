import { AfterViewInit, Component, ElementRef, inject, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HowItWorks } from './Components/how-it-works/how-it-works';
import { ForWhom } from "./Components/for-whom/for-whom";
import { Testimonials } from "./Components/testimonials/testimonials";
import { Cta } from "./Components/cta-section/cta-section";
import { AppFooter } from "./Components/app-footer/app-footer";
import { Navbar } from "./Components/navbar/navbar";
import { StarsCanvas } from "./Components/stars-canvas/stars-canvas";
import { Cursor } from "./Components/cursor/cursor";
import { StatusBar } from "./Components/status-bar/status-bar";
import { Hero } from "./Components/hero/hero";
import { AuthService } from './core/Services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('Prisma.Client');

  auth = inject(AuthService);
  router = inject(Router);

  ngOnInit() {

    console.log('App Init');
    // this.auth.login({
    //   id: '1',
    //   name: 'Test User',
    //   email: 'test@test.com',
    //   role: 'admin', // 'student' | 'admin' | 'teacher' | 'assistant'
    // });

  }

}
