import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideFileExclamationPoint } from '@ng-icons/lucide';
import { ConfigService } from '../../core/Services/config';
import { FooterComponent } from '../../features/common/components/footer/footer';
import { NavbarComponent } from '../../features/common/components/navbar/navbar';
// import { AiChatComponent } from '../../features/student/components/ai-chat-component/ai-chat-component';
import { StarsCanvas } from '../../features/common/components/stars-canvas/stars-canvas';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, StarsCanvas, NavbarComponent, FooterComponent, NgIcon],
  templateUrl: './main-layout.html',
  viewProviders: [provideIcons({ lucideFileExclamationPoint })],
})
export class MainLayoutPageComponent {
  protected readonly configService = inject(ConfigService);
  protected readonly pertinentConfig = this.configService.config;
  protected readonly errorMessage = this.configService.errorMessage;
  // private readonly auth = inject(AuthStore);
  // protected isAuthenticated = this.auth.isAuthenticated;
}
