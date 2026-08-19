import { Component } from '@angular/core';
import { Hero } from '../../components/hero/hero';
import { StatusBar } from '../../components/status-bar/status-bar';
import { FeaturesBento } from '../../components/features-bento/features-bento';
import { HowItWorks } from '../../components/how-it-works/how-it-works';
import { ForWhom } from '../../components/for-whom/for-whom';
import { Testimonials } from '../../components/testimonials/testimonials';
import { CtaSection } from '../../components/cta-section/cta-section';
import { ContactUsComponent } from '../contact-us/contact-us';

@Component({
  selector: 'app-landing-page',
  imports: [
    Hero,
    StatusBar,
    FeaturesBento,
    HowItWorks,
    ForWhom,
    Testimonials,
    CtaSection,
    ContactUsComponent,
  ],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {}
