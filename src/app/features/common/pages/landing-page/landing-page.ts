import { Component } from '@angular/core';
import { HeroComponent } from '../../components/hero/hero';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import {
  contentEntranceAnimate,
  contentEntranceInitial,
  contentEntranceTransition,
  fadeAnimate,
  fadeInitial,
} from '../../../../core/animations/motion.animations';
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
    NgmMotionDirective,
    StatusBar,
    FeaturesBentoComponent,
    HowItWorks,
    ForWhom,
    CtaSectionComponent,
  ],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPageComponent {
  protected readonly pageInitial = fadeInitial;
  protected readonly pageAnimate = fadeAnimate;
  protected readonly sectionInitial = contentEntranceInitial;
  protected readonly sectionInView = contentEntranceAnimate;
  protected readonly sectionTransition = contentEntranceTransition;
  protected readonly sectionViewport = { once: true, amount: 0.16 } as const;
}
