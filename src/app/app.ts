import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSonnerToaster, toast } from 'ngx-sonner';
import { StarsCanvas } from './features/common/components/stars-canvas/stars-canvas';
import { OfflineOverlay } from './shared/components/offline-overlay/offline-overlay';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSonnerToaster, StarsCanvas, OfflineOverlay],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class AppComponent {
  protected readonly title = signal('Prisma.Client');
  protected readonly toast = toast;
}
