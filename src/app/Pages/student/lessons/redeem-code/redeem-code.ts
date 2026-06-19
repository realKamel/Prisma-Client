import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LessonContextComponent } from '../checkout-page/component/lesson-context-component/lesson-context-component';
import { LessonService } from '../../../../core/Services/lesson.service';

@Component({
  selector: 'app-redeem-code',
  imports: [CommonModule, RouterLink, FormsModule, LessonContextComponent],
  templateUrl: './redeem-code.html',
})
export class RedeemCode {
  private lessonService = inject(LessonService);

  // حالات لوحة الكود الأساسية: 'entry' | 'success'
  public cardState: 'entry' | 'success' = 'entry';
  
  // متغير الكود المربوط بالواجهة
  public activationCode = '';
  
  // حالات التحقق والمعالجة
  public isProcessing = false;
  public inputStatus: 'none' | 'valid' | 'invalid' = 'none';
  public activeError: 'wrong' | 'used' | 'expired' | 'lesson' | null = null;
  public isShaking = false;
  public expiryDateString = '';

  // مجموعات الأكواد التجريبية لمحاكاة استجابة الخادم
  private readonly VALID_CODES        = ['PHY2024001', 'PHY-2024-001', 'FATIMA001', 'PHYS2025'];
  private readonly USED_CODES         = ['USED001', 'PHYUSED'];
  private readonly EXPIRED_CODES      = ['EXPIRED', 'PHY2023001'];
  private readonly WRONG_LESSON_CODES = ['CHEM001', 'MATH2024', 'BIO2025', 'OTHERCOURSE'];
  private cdr = inject(ChangeDetectorRef);
  get lesson() {
    return this.lessonService.currentLesson;
  }

  ngOnInit(): void {
    this.calculateExpiry();
  }

  // تنظيف النص وتحديث حالة زر التفعيل ومسح الأخطاء أثناء الكتابة
  onCodeInput(): void {
    this.activeError = null;
    this.inputStatus = 'none';
    
    if (this.activationCode.trim().length >= 6) {
      this.inputStatus = 'valid';
    }
  }

  // تفريغ حقل النص وإعادة ضبط المؤشرات
  clearCode(): void {
    this.activationCode = '';
    this.inputStatus = 'none';
    this.activeError = null;
  }

  // محاكاة معيارية لتنظيف المدخلات (Upper Case وبدون فواصل)
  private normaliseCode(value: string): string {
    return value.toUpperCase().replace(/[\s\-]/g, '');
  }

  // تفعيل تأثير الاهتزاز عند الخطأ
  private triggerShake(): void {
    this.isShaking = true;
    setTimeout(() => this.isShaking = false, 500);
  }

  // إطلاق معالجة وفحص كود التفعيل
  public handleUnlock(): void {
    if (this.isProcessing || this.activationCode.trim().length < 4) return;

    const normalized = this.normaliseCode(this.activationCode.trim());
    this.isProcessing = true;
    this.activeError = null;
    this.inputStatus = 'none';

    setTimeout(() => {
      this.isProcessing = false;

      if (this.USED_CODES.includes(normalized)) {
        this.activeError = 'used';
        this.inputStatus = 'invalid';
        this.triggerShake();
      } else if (this.EXPIRED_CODES.includes(normalized)) {
        this.activeError = 'expired';
        this.inputStatus = 'invalid';
        this.triggerShake();
      } else if (this.WRONG_LESSON_CODES.includes(normalized)) {
        this.activeError = 'lesson';
        this.inputStatus = 'invalid';
        this.triggerShake();
      } else if (this.VALID_CODES.includes(normalized)) {
        this.calculateExpiry();
        this.cardState = 'success';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        this.activeError = 'wrong';
        this.inputStatus = 'invalid';
        this.triggerShake();
      }
      this.cdr.detectChanges();
    }, 1800);
  }

  // حساب تاريخ الانتهاء (اليوم + ٣٠ يوماً) باللغة العربية للواجهة الناجحة
  private calculateExpiry(): void {
    const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    const exp = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    // تحويل الأرقام إلى الهندية/العربية المستعملة في الواجهة إذا لزم الأمر أو تركها قياسية
    const day = exp.getDate();
    const month = months[exp.getMonth()];
    const year = exp.getFullYear();
    
    this.expiryDateString = `${day} ${month} ${year}`;
  }
}