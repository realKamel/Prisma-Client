import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HowItWorks } from './Components/how-it-works/how-it-works';
import { ForWhom } from "./Components/for-whom/for-whom";
import { Testimonials } from "./Components/testimonials/testimonials";
import { CtaSection } from "./Components/cta-section/cta-section";
import { AppFooter } from "./Components/app-footer/app-footer";
import { FeaturesBento } from "./Components/features-bento/features-bento";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HowItWorks, ForWhom, Testimonials, CtaSection, AppFooter, FeaturesBento],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Prisma.Client');
}