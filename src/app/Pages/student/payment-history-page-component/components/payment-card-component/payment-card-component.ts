import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PaymentMethod, PaymentRecordDto, PaymentStatus, PosterVariant } from '../../../../../core/Models/Student/payment-history.model';
import { ArDatePipe } from '../../../../../core/pipes/ar-date.pipe';
import { ArNumberPipe } from '../../../../../core/pipes/ar-number.pipe';


interface PosterConfig {
  gradientClass: string;
  icon: string;
}

interface PillConfig {
  label: string;
  classes: string;
}

const POSTER_CONFIG: Record<PosterVariant, PosterConfig> = {
  energy: { gradientClass: 'from-[#1a3a4a] to-[#2a6060]', icon: 'bi-lightning-charge-fill' },
  magnet: { gradientClass: 'from-[#2d1b4e] to-[#4a3080]', icon: 'bi-magnet-fill' },
  wave: { gradientClass: 'from-[#1a4030] to-[#2d6b50]', icon: 'bi-soundwave' },
  gear: { gradientClass: 'from-[#3a2a1a] to-[#6b4a2d]', icon: 'bi-gear-fill' },
  atom: { gradientClass: 'from-[#1a2a4a] to-[#2d4a7a]', icon: 'bi-share-fill' },
  thermo: { gradientClass: 'from-[#3a1a1a] to-[#7a2d2d]', icon: 'bi-thermometer-half' },
  optics: { gradientClass: 'from-[#1a3a3a] to-[#2d6b6b]', icon: 'bi-eye-fill' },
};

const METHOD_PILL: Record<PaymentMethod, PillConfig> = {
  code: { label: 'كود', classes: 'bg-[rgba(var(--accent-rgb),0.14)] text-[var(--purple-lt)]' },
  online: { label: 'أونلاين', classes: 'bg-[rgba(78,203,141,0.14)] text-[var(--mint)]' },
  'teacher grant': { label: 'منح معلم', classes: 'bg-[rgba(240,106,106,0.12)] text-[var(--coral)]' },
};

const STATUS_PILL: Record<PaymentStatus, PillConfig> = {
  paid: { label: 'مدفوع', classes: 'bg-[rgba(78,203,141,0.14)] text-[var(--mint)]' },
  expired: { label: 'منتهية الصلاحية', classes: 'bg-[rgba(240,106,106,0.12)] text-[var(--coral)]' },
};

@Component({
  selector: 'app-payment-card',
  standalone: true,
  imports: [NgClass, ArDatePipe, ArNumberPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payment-card-component.html',
})
export class PaymentCardComponent {
  readonly payment = input.required<PaymentRecordDto>();

  readonly poster = computed(() => POSTER_CONFIG[this.payment().posterVariant]);
  readonly methodPill = computed(() => METHOD_PILL[this.payment().method]);
  readonly statusPill = computed(() => STATUS_PILL[this.payment().status]);
}