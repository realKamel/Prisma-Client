import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import {
  PaymentMethod,
  PaymentRecordDto,
  PaymentStatus,
} from '../../../../../../core/models/student/payment-history.model';

interface PillConfig {
  label: string;
  classes: string;
}

// Full class strings so Tailwind can detect them
const TILE_GRADIENTS = [
  'from-[#1a3a4a] to-[#2a6060]',
  'from-[#2d1b4e] to-[#4a3080]',
  'from-[#1a4030] to-[#2d6b50]',
  'from-[#3a2a1a] to-[#6b4a2d]',
  'from-[#1a2a4a] to-[#2d4a7a]',
  'from-[#3a1a1a] to-[#7a2d2d]',
  'from-[#1a3a3a] to-[#2d6b6b]',
] as const;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

const METHOD_PILL: Record<PaymentMethod, PillConfig> = {
  CODE: { label: 'كود', classes: 'bg-[rgba(var(--color-primary-rgb),0.14)] text-primary-light' },
  ONLINE: { label: 'أونلاين', classes: 'bg-[rgba(78,203,141,0.14)] text-mint' },
  TEACHER_GRANT: {
    label: 'منح معلم',
    classes: 'bg-[rgba(240,106,106,0.12)] text-coral',
  },
};

const STATUS_PILL: Record<PaymentStatus, PillConfig> = {
  paid: { label: 'مدفوع', classes: 'bg-[rgba(78,203,141,0.14)] text-mint' },
  expired: { label: 'منتهية الصلاحية', classes: 'bg-[rgba(240,106,106,0.12)] text-coral' },
};

@Component({
  selector: 'app-payment-card',
  imports: [DatePipe, DecimalPipe, RouterLink, NgmMotionDirective],
  templateUrl: './payment-card-component.html',
})
export class PaymentCardComponent {
  readonly payment = input.required<PaymentRecordDto>();
  readonly animationDelay = input(0);

  readonly tileGradient = computed(
    () => TILE_GRADIENTS[hashString(this.payment().lessonId) % TILE_GRADIENTS.length],
  );
  readonly monogram = computed(() => Array.from(this.payment().lessonTitle.trim())[0] ?? '•');
  readonly methodPill = computed(() => METHOD_PILL[this.payment().method]);
  readonly statusPill = computed(() => STATUS_PILL[this.payment().status]);
}
