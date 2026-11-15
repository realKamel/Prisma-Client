import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapArrowLeft,
  bootstrapAwardFill,
  bootstrapChatDotsFill,
  bootstrapExclamationTriangleFill,
  bootstrapFacebook,
  bootstrapGlobe,
  bootstrapInstagram,
  bootstrapCreditCardFill,
  bootstrapMegaphoneFill,
  bootstrapMortarboardFill,
  bootstrapPersonPlusFill,
  bootstrapPlayCircleFill,
  bootstrapSearch,
  bootstrapTelegram,
  bootstrapTiktok,
  bootstrapWhatsapp,
  bootstrapX,
  bootstrapYoutube,
} from '@ng-icons/bootstrap-icons';
// Adjust these two paths to your folder layout.
import { CountUpDirective } from '../../../../../shared/directives/count-up/count-up.directive';
import {
  ContactPlatform,
  DEFAULT_PROFILE_COLOR,
  PROFILE_COLORS,
  profileGradient,
} from '../../../../teacher/models/my-profile.model';
import { ProfileLessonCardComponent } from './profile-lesson-card/profile-lesson-card';
import { TeacherProfileStore } from './teacher-profile-store';

const CONTACT_PLATFORMS: readonly { key: ContactPlatform; label: string; icon: string }[] = [
  { key: 'whatsapp', label: 'واتساب', icon: 'bootstrapWhatsapp' },
  { key: 'telegram', label: 'تيليجرام', icon: 'bootstrapTelegram' },
  { key: 'youtube', label: 'يوتيوب', icon: 'bootstrapYoutube' },
  { key: 'facebook', label: 'فيسبوك', icon: 'bootstrapFacebook' },
  { key: 'instagram', label: 'إنستغرام', icon: 'bootstrapInstagram' },
  { key: 'tiktok', label: 'تيك توك', icon: 'bootstrapTiktok' },
  { key: 'website', label: 'الموقع', icon: 'bootstrapGlobe' },
];

interface StartStep {
  icon: string;
  title: string;
  text: string;
  /** Renders the sign-in / register buttons inside the step. */
  needsAuth?: boolean;
}

/** Only for visitors who aren't signed in; goes in front of the other steps. */
const AUTH_STEP: StartStep = {
  icon: 'bootstrapPersonPlusFill',
  title: 'سجّل حسابك',
  text: 'سجّل دخولك أو أنشئ حسابًا جديدًا لتشترك في الدروس وتتواصل مع المدرس.',
  needsAuth: true,
};

/** Same for every teacher: how a student gets from this page to learning. */
const START_STEPS: readonly StartStep[] = [
  {
    icon: 'bootstrapSearch',
    title: 'اختر الدرس',
    text: 'تصفح دروس المدرس واختر ما يناسب سنتك الدراسية.',
  },
  {
    icon: 'bootstrapCreditCardFill',
    title: 'اشترك في الدرس',
    text: 'ادفع أونلاين أو فعّل كود الدرس.',
  },
  {
    icon: 'bootstrapPlayCircleFill',
    title: 'ابدأ التعلم',
    text: 'شاهد الأقسام بالترتيب وحل الاختبار وتابع تقدمك.',
  },
];

/** A dismissal is remembered per teacher and per announcement, so a changed text shows again. */
const dismissKey = (teacherId: string) => `teacher-announcement-dismissed:${teacherId}`;
const announcementSignature = (a: { text: string; endsAt: string | null }) =>
  `${a.text}|${a.endsAt ?? ''}`;

function readDismissed(teacherId: string): string | null {
  try {
    return localStorage.getItem(dismissKey(teacherId));
  } catch {
    return null; // storage blocked (private mode): the banner just shows every time
  }
}

function writeDismissed(teacherId: string, signature: string): void {
  try {
    localStorage.setItem(dismissKey(teacherId), signature);
  } catch {
    // ignore: the banner is closed for this visit anyway
  }
}

/** Turns a stored link into a safe href, or null when there is nothing usable. */
function toHref(key: ContactPlatform, value: string | null | undefined): string | null {
  const v = value?.trim();
  if (!v) return null;

  if (key === 'whatsapp') {
    // Stored as digits; tolerate a stray "+" or spaces.
    const digits = v.replace(/\D/g, '');
    return digits ? `https://wa.me/${digits}` : null;
  }

  // Never render javascript: or other schemes coming from the database.
  return /^https?:\/\//i.test(v) ? v : null;
}

@Component({
  selector: 'app-teacher-profile',
  imports: [RouterModule, NgIcon, DatePipe, ProfileLessonCardComponent, CountUpDirective],
  templateUrl: './teacher-profile.html',
  styleUrls: ['./teacher-profile.css'],
  viewProviders: [
    provideIcons({
      bootstrapArrowLeft,
      bootstrapAwardFill,
      bootstrapChatDotsFill,
      bootstrapExclamationTriangleFill,
      bootstrapFacebook,
      bootstrapGlobe,
      bootstrapInstagram,
      bootstrapCreditCardFill,
      bootstrapMegaphoneFill,
      bootstrapMortarboardFill,
      bootstrapPersonPlusFill,
      bootstrapPlayCircleFill,
      bootstrapSearch,
      bootstrapTelegram,
      bootstrapTiktok,
      bootstrapWhatsapp,
      bootstrapX,
      bootstrapYoutube,
    }),
  ],
})
export class TeacherProfileComponent {
  private readonly store = inject(TeacherProfileStore);
  private readonly router = inject(Router);

  /** Teacher guid coming from the `teacher/:id/profile` route param. */
  readonly id = input.required<string>();

  // Read-only selectors from the signal store
  protected readonly profile = this.store.profile;
  protected readonly isLoading = this.store.isLoading;
  protected readonly error = this.store.error;
  protected readonly lessons = this.store.lessons;

  protected readonly fullName = computed(() => {
    const p = this.profile();
    return p ? `${p.firstName} ${p.secondName}` : '';
  });

  protected readonly gradient = computed(() =>
    profileGradient(this.profile()?.color ?? DEFAULT_PROFILE_COLOR),
  );

  /** One solid colour of the teacher's preset, for effects that can't use a gradient. */
  protected readonly accentSolid = computed(() => {
    const color = this.profile()?.color ?? DEFAULT_PROFILE_COLOR;
    return (PROFILE_COLORS.find((p) => p.key === color) ?? PROFILE_COLORS[0]).to;
  });

  /** Only the numbers the teacher chose to show; the card shrinks to fit. */
  protected readonly stats = computed(() => {
    const p = this.profile();
    if (!p) return [];

    const items: { label: string; value: number }[] = [];
    if (p.totalStudents !== null) items.push({ label: 'طالب', value: p.totalStudents });
    if (p.lessonsCount !== null) items.push({ label: 'درس', value: p.lessonsCount });
    if (p.yearsOfExperience !== null) {
      items.push({ label: 'سنة خبرة', value: p.yearsOfExperience });
    }
    if (p.academicYears.length > 0) {
      items.push({ label: 'سنة دراسية', value: p.academicYears.length });
    }
    return items;
  });

  private readonly dismissTick = signal(0);

  /** The pinned announcement, unless this visitor already closed this exact one. */
  protected readonly announcement = computed(() => {
    this.dismissTick();
    const p = this.profile();
    const a = p?.announcement;
    if (!p || !a) return null;
    return readDismissed(p.id) === announcementSignature(a) ? null : a;
  });

  protected readonly steps = computed<readonly StartStep[]>(() =>
    this.profile()?.isSignedIn === false ? [AUTH_STEP, ...START_STEPS] : START_STEPS,
  );

  protected readonly contactLinks = computed(() => {
    const links = this.profile()?.links;
    if (!links) return [];

    return CONTACT_PLATFORMS.flatMap(({ key, label, icon }) => {
      const href = toHref(key, links[key]);
      return href ? [{ key, label, icon, href }] : [];
    });
  });

  constructor() {
    // Load the profile for the current teacher; also reacts to route param changes.
    effect(() => {
      const teacherId = this.id();
      untracked(() => {
        if (teacherId) this.store.loadProfile(teacherId);
      });
    });
  }

  protected dismissAnnouncement(): void {
    const p = this.profile();
    if (!p?.announcement) return;

    writeDismissed(p.id, announcementSignature(p.announcement));
    this.dismissTick.update((n) => n + 1);
  }

  /**
   * Opens the in-site chat with this teacher (the teacher's id is their user id).
   * PLACEHOLDER route: point it at however your chat page starts a conversation
   * with a given user id.
   */
  protected openChat(): void {
    void this.router.navigate(['/messages'], { queryParams: { with: this.id() } });
  }
}