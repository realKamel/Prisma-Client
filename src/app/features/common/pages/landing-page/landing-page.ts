import { Component } from '@angular/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { contentEntranceTransition } from '../../../../core/animations/motion.animations';
import { ScrollRevealComponent } from '../../../../shared/components/scroll-reveal/scroll-reveal';
import { CtaSectionComponent } from '../../components/cta-section/cta-section';
import { FeaturesBentoComponent } from '../../components/features-bento/features-bento';
import { ForWhom } from '../../components/for-whom/for-whom';
import { HeroComponent } from '../../components/hero/hero';
import { HowItWorksComponent } from '../../components/how-it-works/how-it-works';
import { StatusBar } from '../../components/status-bar/status-bar';

@Component({
  selector: 'app-landing-page',
  imports: [
    HeroComponent,
    NgmMotionDirective,
    ScrollRevealComponent,
    StatusBar,
    FeaturesBentoComponent,
    HowItWorksComponent,
    ForWhom,
    CtaSectionComponent,
  ],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPageComponent {
  /** Entrance timing for the hero block — sections own their own reveal timing. */
  protected readonly heroTransition = contentEntranceTransition;
}
