import {Component, ElementRef, inject, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { AuthService } from './core/Services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
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
