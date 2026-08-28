import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfigService } from '../../core/Services/config';
import { AuthStore } from '../../core/stores/auth.store';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideFileExclamationPoint } from '@ng-icons/lucide';
import { NavbarComponent } from '../../features/common/components/navbar/navbar';
import { FooterComponent } from '../../features/common/components/footer/footer';
// import { AiChatComponent } from '../../features/student/components/ai-chat-component/ai-chat-component';
import { StarsCanvas } from '../../features/common/components/stars-canvas/stars-canvas';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, StarsCanvas, NavbarComponent, FooterComponent, NgIcon],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
  viewProviders: [provideIcons({ lucideFileExclamationPoint })],
})
export class MainLayoutPageComponent {
  configService = inject(ConfigService);
  private readonly auth = inject(AuthStore);
  protected isAuthenticated = this.auth.isAuthenticated;
}
