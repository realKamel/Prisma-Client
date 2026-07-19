import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { StepContactComponent } from './step-contact/step-contact';
import { StepOtpComponent } from './step-otp/step-otp';
import { StepNewPasswordComponent } from './step-new-password/step-new-password';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StepContactComponent,
    StepOtpComponent,
    StepNewPasswordComponent,
  ],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css'],
})
export class ForgotPasswordComponent {
  private router = inject(Router);

  currentStep = 1;
  contactValue = '';
  showSuccess = false;

  onContactSubmitted(contact: string) {
    this.contactValue = contact;
    this.currentStep = 2;
  }

  onOtpVerified() {
    this.currentStep = 3;
  }

  onPasswordSaved() {
    this.showSuccess = true;
  }

  onBackToContact() {
    this.currentStep = 1;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
