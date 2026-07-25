import { Component, inject, signal } from '@angular/core';

import { Router, RouterModule } from '@angular/router';
import { StepContactComponent } from './step-contact/step-contact';
import { StepOtpComponent } from './step-otp/step-otp';
import { StepNewPasswordComponent } from './step-new-password/step-new-password';

@Component({
  selector: 'app-forgot-password',
  imports: [RouterModule, StepContactComponent, StepOtpComponent, StepNewPasswordComponent],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css'],
})
export class ForgotPasswordComponent {
  private router = inject(Router);

  readonly currentStep = signal(1);
  readonly contactValue = signal('');
  readonly showSuccess = signal(false);

  onContactSubmitted(contact: string) {
    this.contactValue.set(contact);
    this.currentStep.set(2);
  }

  onOtpVerified() {
    this.currentStep.set(3);
  }

  onPasswordSaved() {
    this.showSuccess.set(true);
  }

  onBackToContact() {
    this.currentStep.set(1);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
