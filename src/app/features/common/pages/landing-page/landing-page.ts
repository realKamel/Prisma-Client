import { Component } from '@angular/core';
import { HeroComponent } from '../../components/hero/hero';
import { StatusBar } from '../../components/status-bar/status-bar';
import { FeaturesBentoComponent } from '../../components/features-bento/features-bento';
import { HowItWorks } from '../../components/how-it-works/how-it-works';
import { ForWhom } from '../../components/for-whom/for-whom';
import { Testimonials } from '../../components/testimonials/testimonials';
import { CtaSectionComponent } from '../../components/cta-section/cta-section';
import { ContactUsComponent } from '../contact-us/contact-us';

@Component({
  selector: 'app-landing-page',
  imports: [
    HeroComponent,
    StatusBar,
    FeaturesBentoComponent,
    HowItWorks,
    ForWhom,
    CtaSectionComponent,
  ],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPageComponent {}
