import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StarsCanvas } from '../../Components/stars-canvas/stars-canvas';
import { Navbar } from '../../Components/navbar/navbar';
import { Footer } from '../../Components/footer/footer';
import { ConfigService } from '../../core/Services/config';
import { AiChatComponent } from '../../Pages/student/ai-chat-component/ai-chat-component';
import { AuthStore } from '../../core/stores/user-store/user-store';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideFileExclamationPoint } from '@ng-icons/lucide';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, StarsCanvas, Navbar, Footer, AiChatComponent,NgIcon],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
  viewProviders: [provideIcons({lucideFileExclamationPoint})]
})
export class MainLayout {
  configService = inject(ConfigService);
  private readonly auth = inject(AuthStore);
  protected isAuthenticated = this.auth.isAuthenticated;
}
