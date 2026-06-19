import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LessonContextComponent } from "../lesson-context-component/lesson-context-component";
import { LessonService } from '../../../../../../core/Services/lesson.service';

@Component({
  selector: 'app-checkout-card',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LessonContextComponent],
  templateUrl: './checkout-card-component.html'
})
export class CheckoutCardComponent {
  private lessonService = inject(LessonService);
  private cdr = inject(ChangeDetectorRef);
  // حالات الدفع المتاحة: 'form' | 'success' | 'failed'
  public checkoutState: 'form' | 'success' | 'failed' = 'form';
  
  // بيانات البطاقة
  public cardNumber = '';
  public cardName = '';
  public cardExpiry = '';
  public cardCvv = '';
  
  // معالجة الواجهة
  public cardBrand = '';
  public last4Digits = '0000';
  public formattedDate = '';
  public errorMessage = '';
  public isProcessing = false;

  get lesson() {
    return this.lessonService.currentLesson;
  }

  // تنسيق رقم البطاقة وجلب نوعها تلقائياً
  onCardNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let raw = input.value.replace(/\D/g, '').slice(0, 16);
    this.cardNumber = raw.match(/.{1,4}/g)?.join(' ') ?? raw;
    
    const firstDigit = raw[0];
    if (firstDigit === '4') {
      this.cardBrand = 'visa';
    } else if (firstDigit === '5') {
      this.cardBrand = 'master';
    } else if (raw.length > 0) {
      this.cardBrand = 'other';
    } else {
      this.cardBrand = '';
    }
  }

  // تنسيق تاريخ الانتهاء MM/YY
  onExpiryInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let raw = input.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = raw.slice(0, 2) + '/' + raw.slice(2);
    }
    this.cardExpiry = raw;
  }

  // تنظيف مدخلات الـ CVV لتكون أرقام فقط
  onCvvInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.cardCvv = input.value.replace(/\D/g, '').slice(0, 4);
  }

  // معالجة الدفع والتحقق من البيانات
  processPayment(): void {
    const rawNum = this.cardNumber.replace(/\s/g, '');
    this.errorMessage = '';

    if (rawNum.length < 16) {
      this.errorMessage = 'ادخل رقم بطاقة صحيح (١٦ رقم)';
      return;
    }
    if (!this.cardName.trim()) {
      this.errorMessage = 'ادخل الاسم المكتوب على البطاقة';
      return;
    }
    if (this.cardExpiry.length < 5) {
      this.errorMessage = 'ادخل تاريخ انتهاء صحيح (MM/YY)';
      return;
    }
    if (this.cardCvv.length < 3) {
      this.errorMessage = 'ادخل الـ CVV (٣ أو ٤ أرقام)';
      return;
    }

    this.isProcessing = true;

    // محاكاة الاتصال ببوابة الدفع (1.8 ثانية)
    setTimeout(() => {
      this.isProcessing = false;
      this.last4Digits = rawNum.slice(-4);
      this.formattedDate = new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });
      // إذا كانت البطاقة تبدأ بـ 4 (Visa) تنجح العملية، غير ذلك تفشل لمحاكاة الواجهتين
      if (rawNum.startsWith('4')) {
        this.checkoutState = 'success';    

      } else {
        this.checkoutState = 'failed';  

      }
      this.cdr.detectChanges();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1800);
  }

  // إعادة التجربة عند الفشل
  retryPayment(): void {
    this.cardNumber = '';
    this.cardName = '';
    this.cardExpiry = '';
    this.cardCvv = '';
    this.cardBrand = '';
    this.errorMessage = '';
    this.checkoutState = 'form';
  }
}