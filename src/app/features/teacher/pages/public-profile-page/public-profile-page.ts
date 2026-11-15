import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  OnInit,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { bootstrapArrowClockwise, bootstrapExclamationTriangle } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { toast } from 'ngx-sonner';
import { map } from 'rxjs';
import { requiredText } from '../../../../shared/components/forms/form-error';
import { CompletenessItem, ProfileCompletenessComponent } from './components/profile-completeness/profile-completeness';
import { ContactLinksFieldComponent } from './components/contact-links-field/contact-links-field';
import { ProfileColorPickerComponent } from './components/profile-color-picker/profile-color-picker';
import { ProfileHeroPreviewComponent } from './components/profile-hero-preview/profile-hero-preview';
import { ProfilePictureEditorComponent } from './components/profile-picture-editor/profile-picture-editor';
import { VisibilitySectionComponent } from './components/visibility-section/visibility-section';
import { MyProfile, ProfileColor, UpdateMyProfileRequest } from '../../models/my-profile.model';
import { MyProfileStore } from './components/my-profile.store';
import { contactLinkValidator, toLinksPayload } from './components/contact-links-field/contact-links';
import { FormErrorComponent } from '../../../../shared/components/forms/form-error.component';
import { HasUnsavedChanges } from '../../guards/Unsaved-changes.guard';

const ANNOUNCEMENT_MAX = 160;
const BIO_MAX = 600;
const BIO_MIN_FOR_COMPLETENESS = 80;
const SUBJECT_MAX = 40;
const NAME_PATTERN = /^[\p{L}\s'-]+$/u;

@Component({
  selector: 'app-public-profile-page',
  imports: [
    ReactiveFormsModule,
    NgIcon,
    TranslatePipe,
    NgmMotionDirective,
    FormErrorComponent,
    ProfileHeroPreviewComponent,
    ProfileCompletenessComponent,
    ProfilePictureEditorComponent,
    ProfileColorPickerComponent,
    ContactLinksFieldComponent,
    VisibilitySectionComponent,
  ],
  templateUrl: './public-profile-page.html',
  viewProviders: [provideIcons({ bootstrapArrowClockwise, bootstrapExclamationTriangle })],
})
export class PublicProfilePageComponent implements OnInit, HasUnsavedChanges {
  protected readonly store = inject(MyProfileStore);
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly bioMax = BIO_MAX;
  protected readonly announcementMax = ANNOUNCEMENT_MAX;
  /** The date input can't pick a day that has already passed. */
  protected readonly today = toDateInput(new Date().toISOString());

  // Per-field wording on top of the generic messages.
  protected readonly nameErrors = {
    required: 'VALIDATION.NAME_PARTS_REQUIRED',
    minlength: 'VALIDATION.NAME_PARTS_REQUIRED',
    maxlength: 'VALIDATION.NAME_PART_MAX_LENGTH',
    pattern: 'VALIDATION.NAME_LETTERS_ONLY',
  };
  protected readonly yearsErrors = { pattern: 'VALIDATION.WHOLE_NUMBER' };

  private static nameRules = [
    requiredText,
    Validators.minLength(2),
    Validators.maxLength(20),
    Validators.pattern(NAME_PATTERN),
  ];

  protected readonly form = this.fb.group({
    firstName: ['', PublicProfilePageComponent.nameRules],
    secondName: ['', PublicProfilePageComponent.nameRules],
    thirdName: ['', PublicProfilePageComponent.nameRules],
    lastName: ['', PublicProfilePageComponent.nameRules],
    subject: ['', [requiredText, Validators.maxLength(SUBJECT_MAX)]],
    bio: ['', [Validators.maxLength(BIO_MAX)]],
    announcementText: ['', [Validators.maxLength(ANNOUNCEMENT_MAX)]],
    announcementEndsAt: [''],
    yearsOfExperience: [
      null as number | null,
      [Validators.min(0), Validators.max(60), Validators.pattern(/^\d{1,2}$/)],
    ],
    color: ['ocean' as ProfileColor],
    links: this.fb.group({
      whatsapp: ['', contactLinkValidator('whatsapp')],
      facebook: ['', contactLinkValidator('facebook')],
      instagram: ['', contactLinkValidator('instagram')],
      youtube: ['', contactLinkValidator('youtube')],
      telegram: ['', contactLinkValidator('telegram')],
      tiktok: ['', contactLinkValidator('tiktok')],
      website: ['', contactLinkValidator('website')],
    }),
    visibility: this.fb.group({
      showYearsOfExperience: [true],
      showContactLinks: [true],
      showStudentsCount: [true],
      showLessonsCount: [true],
      showPopularLessons: [true],
    }),
  });

  /** One stream for both "what is typed" and "is it dirty": drives preview, save bar and guard. */
  private readonly state = toSignal(
    this.form.events.pipe(map(() => ({ value: this.form.getRawValue(), dirty: this.form.dirty }))),
    { initialValue: { value: this.form.getRawValue(), dirty: false } },
  );
  protected readonly value = computed(() => this.state().value);

  // ── Picture (selected but not saved yet) ──
  protected readonly pictureFile = signal<File | null>(null);
  private readonly removePicture = signal(false);
  private readonly localPreviewUrl = signal<string | null>(null);

  protected readonly displayUrl = computed(
    () => this.localPreviewUrl() ?? (this.removePicture() ? null : this.store.picture().url),
  );
  /** The editor is locked while saving and while a previous picture is still uploading/scanning. */
  protected readonly pictureLocked = computed(() => this.store.saving() || this.store.isPictureBusy());

  protected readonly failedDetail = computed(() => {
    const task = this.store.pictureTask();
    return task.phase === 'failed' ? task.detail : null;
  });

  protected readonly hasChanges = computed(
    () => this.state().dirty || this.pictureFile() !== null || this.removePicture(),
  );

  protected readonly previewName = computed(() => {
    const v = this.value();
    return [v.firstName, v.secondName].filter((part) => part?.trim()).join(' ');
  });
  protected readonly previewYears = computed(() => {
    const v = this.value();
    return v.visibility.showYearsOfExperience ? v.yearsOfExperience : null;
  });
  protected readonly bioLength = computed(() => (this.value().bio ?? '').length);
  protected readonly announcementLength = computed(() => (this.value().announcementText ?? '').length,);
  protected readonly announcementExpired = computed(() => {
    const date = this.value().announcementEndsAt;
    return !!date && date < this.today;
  });
  protected readonly completeness = computed<CompletenessItem[]>(() => {
    const v = this.value();
    const L = 'TEACHER_PROFILE_PAGE.COMPLETENESS.';
    return [
      { done: !!this.displayUrl(), labelKey: `${L}PICTURE` },
      {
        done: (v.bio ?? '').trim().length >= BIO_MIN_FOR_COMPLETENESS,
        labelKey: `${L}BIO`,
        params: { min: BIO_MIN_FOR_COMPLETENESS },
      },
      { done: v.yearsOfExperience !== null, labelKey: `${L}EXPERIENCE` },
      {
        done: Object.values(v.links).some((link) => !!link?.trim()),
        labelKey: `${L}LINKS`,
      },
    ];
  });

  constructor() {
    // Fill the form when the server snapshot arrives, unless the teacher already started editing.
    effect(() => {
      const profile = this.store.profile();
      if (profile) {
        untracked(() => {
          if (!this.form.dirty) this.applyProfile(profile);
        });
      }
    });

    // Once an upload ends (live or rejected) the server picture is the truth again.
    effect(() => {
      const phase = this.store.pictureTask().phase;
      if (phase === 'idle' && !this.pictureFile()) {
        untracked(() => this.clearLocalPreview());
      }
    });

    inject(DestroyRef).onDestroy(() => this.clearLocalPreview());
  }

  public ngOnInit(): void {
    this.store.load();
    console.log(this.value().color)
  }

  // ─────────────────────────── guard hooks ───────────────────────────

  public hasUnsavedChanges(): boolean {
    return this.hasChanges();
  }

  /** Covers closing the tab or reloading; in-app navigation goes through the route guard. */
  @HostListener('window:beforeunload', ['$event'])
  protected onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.hasChanges()) event.preventDefault();
  }

  // ─────────────────────────── picture ───────────────────────────

  protected onPicturePicked(file: File): void {
    this.clearLocalPreview();
    this.localPreviewUrl.set(URL.createObjectURL(file));
    this.pictureFile.set(file);
    this.removePicture.set(false);
  }

  protected onPictureRemoved(): void {
    this.clearLocalPreview();
    this.pictureFile.set(null);
    this.removePicture.set(!!this.store.picture().url);
  }

  private clearLocalPreview(): void {
    const url = this.localPreviewUrl();
    if (url) URL.revokeObjectURL(url);
    this.localPreviewUrl.set(null);
  }

  // ─────────────────────────── form ───────────────────────────

  protected onColorChanged(color: ProfileColor): void {
    const control = this.form.controls.color;
    control.setValue(color);
    control.markAsDirty();
  }

  protected discard(): void {
    const profile = this.store.profile();
    if (profile) this.applyProfile(profile);
    this.pictureFile.set(null);
    this.removePicture.set(false);
    this.clearLocalPreview();
  }

  protected retryLoad(): void {
    this.store.load();
  }

  protected async save(): Promise<void> {
    if (this.store.saving()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      toast.error(this.translate.instant('TEACHER_PROFILE_PAGE.TOAST.FIX_ERRORS'));
      this.scrollToFirstError();
      return;
    }

    try {
      await this.store.save(this.buildRequest(), this.pictureFile());
    } catch (error) {
      this.handleSaveError(error);
      return;
    }

    // The picture (if any) now uploads on its own; the form is back in sync with the server.
    this.pictureFile.set(null);
    this.removePicture.set(false);
    const saved = this.store.profile();
    if (saved) this.applyProfile(saved);
    toast.success(this.translate.instant('TEACHER_PROFILE_PAGE.TOAST.SAVED'));
  }

  private applyProfile(profile: MyProfile): void {
    this.form.reset({
      firstName: profile.firstName,
      secondName: profile.secondName,
      thirdName: profile.thirdName,
      lastName: profile.lastName,
      subject: profile.subject,
      bio: profile.bio ?? '',
      yearsOfExperience: profile.yearsOfExperience,
      color: profile.color,
      announcementText: profile.announcementText ?? '',
      announcementEndsAt: toDateInput(profile.announcementEndsAt),
      links: {
        whatsapp: profile.links.whatsapp ?? '',
        facebook: profile.links.facebook ?? '',
        instagram: profile.links.instagram ?? '',
        youtube: profile.links.youtube ?? '',
        telegram: profile.links.telegram ?? '',
        tiktok: profile.links.tiktok ?? '',
        website: profile.links.website ?? '',
      },
      visibility: { ...profile.visibility },
    });
  }

  private buildRequest(): UpdateMyProfileRequest {
    const v = this.form.getRawValue();
    const announcementText = (v.announcementText ?? '').trim() || null;
    return {
      firstName: v.firstName!.trim(),
      secondName: v.secondName!.trim(),
      thirdName: v.thirdName!.trim(),
      lastName: v.lastName!.trim(),
      subject: v.subject!.trim(),
      bio: (v.bio ?? '').trim() || null,
      yearsOfExperience: v.yearsOfExperience ?? null,
      color: v.color!,
      links: toLinksPayload(v.links),
      visibility: v.visibility as UpdateMyProfileRequest['visibility'],
      announcementText,
      announcementEndsAt: announcementText ? endOfDayIso(v.announcementEndsAt ?? '') : null,
      removePicture: this.removePicture(),
    };
  }

  /** Puts the backend's validation messages on the matching fields; otherwise shows a toast. */
  private handleSaveError(error: unknown): void {
    const problem =
      error instanceof HttpErrorResponse
        ? (error.error as {
          title?: string;
          detail?: string;
          errors?: Record<string, string[]>;
        } | null)
        : null;

    let matched = false;
    for (const [field, messages] of Object.entries(problem?.errors ?? {})) {
      const control = this.findControl(field);
      if (control && messages[0]) {
        control.setErrors({ server: { key: messages[0] } });
        control.markAsTouched();
        matched = true;
      }
    }

    if (matched) {
      this.scrollToFirstError();
      return;
    }

    toast.error(
      problem?.detail ??
      problem?.title ??
      this.translate.instant('TEACHER_PROFILE_PAGE.TOAST.SAVE_FAILED'),
    );
  }

  private findControl(field: string): AbstractControl | null {
    const name = field.split('.').pop() ?? field;
    const camel = name.charAt(0).toLowerCase() + name.slice(1);
    return (
      this.form.get(camel) ?? this.form.get(`links.${camel}`) ?? this.form.get(`visibility.${camel}`)
    );
  }

  private scrollToFirstError(): void {
    setTimeout(() => {
      this.host.nativeElement
        .querySelector('[data-field-error]')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
}/** ISO date-time -> the `yyyy-MM-dd` an <input type="date"> expects, in the teacher's timezone. */
function toDateInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** The chosen day ends at 23:59:59 local time, so "until Friday" includes Friday. */
function endOfDayIso(date: string): string | null {
  if (!date) return null;
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d, 23, 59, 59).toISOString();
}