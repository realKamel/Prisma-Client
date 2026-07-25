import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, input, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import {
  PosterVariant,
  PaymentMethod,
  PaymentStatus,
  PaymentRecordDto,
} from '../../../../../../core/Models/Student/payment-history.model';

interface PosterConfig {
  gradientClass: string;
  icon: string;
}

interface PillConfig {
  label: string;
  classes: string;
}

const POSTER_CONFIG: Record<PosterVariant, PosterConfig> = {
  energy: { gradientClass: 'from-[#1a3a4a] to-[#2a6060]', icon: 'bootstrapLightningChargeFill' },
  magnet: { gradientClass: 'from-[#2d1b4e] to-[#4a3080]', icon: 'bootstrapMagnetFill' },
  wave: { gradientClass: 'from-[#1a4030] to-[#2d6b50]', icon: 'bootstrapSoundwave' },
  gear: { gradientClass: 'from-[#3a2a1a] to-[#6b4a2d]', icon: 'bootstrapGearFill' },
  atom: { gradientClass: 'from-[#1a2a4a] to-[#2d4a7a]', icon: 'bootstrapShareFill' },
  thermo: { gradientClass: 'from-[#3a1a1a] to-[#7a2d2d]', icon: 'bootstrapThermometerHalf' },
  optics: { gradientClass: 'from-[#1a3a3a] to-[#2d6b6b]', icon: 'bootstrapEyeFill' },
};

const METHOD_PILL: Record<PaymentMethod, PillConfig> = {
  code: { label: 'كود', classes: 'bg-[rgba(var(--accent-rgb),0.14)] text-[var(--purple-lt)]' },
  online: { label: 'أونلاين', classes: 'bg-[rgba(78,203,141,0.14)] text-[var(--mint)]' },
  'teacher grant': {
    label: 'منح معلم',
    classes: 'bg-[rgba(240,106,106,0.12)] text-[var(--coral)]',
  },
};

const STATUS_PILL: Record<PaymentStatus, PillConfig> = {
  paid: { label: 'مدفوع', classes: 'bg-[rgba(78,203,141,0.14)] text-[var(--mint)]' },
  expired: { label: 'منتهية الصلاحية', classes: 'bg-[rgba(240,106,106,0.12)] text-[var(--coral)]' },
};
//FIXME i think an error might happen here
@Component({
  selector: 'app-payment-card',
  imports: [DatePipe, DecimalPipe, RouterLink, NgIcon],
  templateUrl: './payment-card-component.html',
})
export class PaymentCardComponent {
  readonly payment = input.required<PaymentRecordDto>();
  readonly poster = computed(() => POSTER_CONFIG[this.payment().posterVariant]);
  readonly methodPill = computed(() => METHOD_PILL[this.payment().method]);
  readonly statusPill = computed(() => STATUS_PILL[this.payment().status]);
}
