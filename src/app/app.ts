import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HowItWorks } from './Components/how-it-works/how-it-works';
import { ForWhom } from "./Components/for-whom/for-whom";
import { Testimonials } from "./Components/testimonials/testimonials";
import { Cta } from "./Components/cta-section/cta-section";
import { AppFooter } from "./Components/app-footer/app-footer";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HowItWorks, ForWhom, Testimonials, Cta, AppFooter],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Prisma.Client');
}
