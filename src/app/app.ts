import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/Services/auth';
import { toast, NgxSonnerToaster } from 'ngx-sonner';
import { Cursor } from './Components/cursor/cursor';
import { StarsCanvas } from './Components/stars-canvas/stars-canvas';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSonnerToaster, Cursor, StarsCanvas],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('Prisma.Client');
  protected readonly toast = toast;
  auth = inject(AuthService);
  router = inject(Router);
}
