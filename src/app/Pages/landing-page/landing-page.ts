import { Component } from '@angular/core';
import { FeaturesBento } from "../../Components/features-bento/features-bento";
import { HowItWorks } from "../../Components/how-it-works/how-it-works";
import { ForWhom } from "../../Components/for-whom/for-whom";
import { Testimonials } from "../../Components/testimonials/testimonials";
import { CtaSection } from "../../Components/cta-section/cta-section";

@Component({
  selector: 'app-landing-page',
  imports: [FeaturesBento, HowItWorks, ForWhom, Testimonials, CtaSection],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {}
