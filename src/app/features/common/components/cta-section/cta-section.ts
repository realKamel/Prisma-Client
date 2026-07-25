import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideRocket } from '@ng-icons/lucide';
@Component({
  selector: 'app-cta-section',
  imports: [RouterLink, NgIcon],
  templateUrl: './cta-section.html',
  viewProviders:[provideIcons({lucideRocket})]
})
export class CtaSection {}
