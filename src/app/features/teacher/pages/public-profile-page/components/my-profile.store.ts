import { HttpErrorResponse } from '@angular/common/http';
import { Injector, Service, computed, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, firstValueFrom } from 'rxjs';
import {
  MyProfile,
  ProfilePicture,
  ProfileStats,
  UpdateMyProfileRequest,
} from '../../../models/my-profile.model';
import { MyProfileService } from '../../../services/my-profile.service';
import { FileUploadService } from '../../../../../domain/services/file-upload/file-upload.service';
import { UploadTask } from '../../../../../domain/services/file-upload/file-upload.model';

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

export type PictureTask =
  | { phase: 'idle' }
  | { phase: 'uploading' }
  | { phase: 'failed'; detail: string | null };

/**
 * Owns the teacher's profile data and the picture upload.
 * The picture pipeline lives here (not in the page) so it keeps running if the teacher
 * switches tabs while it uploads.
 */
@Service()
export class MyProfileStore {
  private readonly api = inject(MyProfileService);
  private readonly uploads = inject(FileUploadService);
  private readonly injector = inject(Injector);

  private readonly _status = signal<LoadStatus>('idle');
  private readonly _profile = signal<MyProfile | null>(null);
  private readonly _picture = signal<ProfilePicture>({ url: null });
  private readonly _stats = signal<ProfileStats | null>(null);
  private readonly _saving = signal(false);
  private readonly _task = signal<PictureTask>({ phase: 'idle' });

  /** Server snapshot of the editable fields. Only changes on load/save, never after an upload. */
  readonly profile = this._profile.asReadonly();
  readonly status = this._status.asReadonly();
  readonly picture = this._picture.asReadonly();
  readonly stats = this._stats.asReadonly();
  readonly saving = this._saving.asReadonly();
  readonly pictureTask = this._task.asReadonly();
  readonly isPictureBusy = computed(() => this._task().phase === 'uploading');

  private pendingFile: File | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', (event) => {
        if (this.isPictureBusy()) event.preventDefault();
      });
    }
  }

  // ─────────────────────────── loading ───────────────────────────

  load(): void {
    if (this._status() === 'loading') return;
    // Only show the skeleton when there is nothing to show yet.
    if (!this._profile()) this._status.set('loading');

    this.api.getProfile().subscribe({
      next: (profile) => {
        this.applyServer(profile);
        this._status.set('ready');
      },
      error: () => {
        if (!this._profile()) this._status.set('error');
      },
    });
  }

  private applyServer(profile: MyProfile): void {
    this._profile.set(profile);
    this._picture.set(profile.picture);
    this._stats.set(profile.stats);
  }

  // ─────────────────────────── saving ───────────────────────────

  /**
   * Saves the form fields, then (separately, after the save) starts the picture upload.
   * Throws the HttpErrorResponse when the save itself fails, so the page can show field errors.
   */
  async save(request: UpdateMyProfileRequest, picture: File | null): Promise<void> {
    this._saving.set(true);

    try {
      await firstValueFrom(this.api.updateProfile(request));

      try {
        this.applyServer(await firstValueFrom(this.api.getProfile()));
      } catch {
        // The save worked; keep the form values as the new snapshot rather than the stale one.
        const { removePicture, ...fields } = request;
        this._profile.update((current) => (current ? { ...current, ...fields } : current));
        if (removePicture) this._picture.set({ url: null });
      }
    } finally {
      this._saving.set(false);
    }

    if (picture) void this.uploadPicture(picture);
  }

  // ─────────────────────────── picture upload ───────────────────────────

  /** request upload URL -> PUT to storage. A successful PUT means the picture is live. */
  private async uploadPicture(file: File): Promise<void> {
    this.pendingFile = file;
    this._task.set({ phase: 'uploading' });

    try {
      const link = await firstValueFrom(
        this.api.requestPictureUpload({
          fileName: file.name,
          contentType: file.type,
          size: file.size,
        }),
      );

      const outcome = await this.waitForUpload(this.uploads.upload(link.uploadUrl, file));
      if (outcome === 'error') throw new Error('Upload failed');

      // The PUT worked. Fetch the picture's link so the page can show it. Only the picture and
      // stats move; the form snapshot stays untouched so edits in progress aren't reset.
      const latest = await firstValueFrom(this.api.getProfile());
      this._picture.set(latest.picture);
      this._stats.set(latest.stats);

      this.pendingFile = null;
      this._task.set({ phase: 'idle' });
    } catch (error) {
      this._task.set({ phase: 'failed', detail: this.problemDetail(error) });
    }
  }

  retryPicture(): void {
    if (this.pendingFile && !this.isPictureBusy()) void this.uploadPicture(this.pendingFile);
  }

  /** FileUploadService only exposes signals, so wait for its status to settle. */
  private waitForUpload(task: UploadTask): Promise<'completed' | 'error'> {
    return firstValueFrom(
      toObservable(task.status, { injector: this.injector }).pipe(
        filter((status): status is 'completed' | 'error' => status === 'completed' || status === 'error'),
      ),
    );
  }

  private problemDetail(error: unknown): string | null {
    if (!(error instanceof HttpErrorResponse)) return null;
    const problem = error.error as { detail?: string; title?: string } | null;
    return problem?.detail ?? problem?.title ?? null;
  }
}