import { Component } from '@angular/core';
import { Hero } from "../../../Components/hero/hero";
import { StatusBar } from "../../../Components/status-bar/status-bar";
import { FeaturesBento } from "../../../Components/features-bento/features-bento";
import { HowItWorks } from "../../../Components/how-it-works/how-it-works";
import { ForWhom } from "../../../Components/for-whom/for-whom";
import { Testimonials } from "../../../Components/testimonials/testimonials";
import { CtaSection } from "../../../Components/cta-section/cta-section";

@Component({
  selector: 'app-landing-page',
  imports: [Hero, StatusBar, FeaturesBento, HowItWorks, ForWhom, Testimonials, CtaSection],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {}
