import { HttpClient } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';
import * as tus from 'tus-js-client';
import { environment } from '../../../../environments/environment';
import {
  PrepareUploadVideoLinkResponse,
  ResumeRecord,
  TusVideoUploadCredentials,
  UploadVideoOptions,
  VideoUploadState,
} from './videos.models';

const IDLE_STATE: VideoUploadState = {
  status: 'idle',
  bytesUploaded: 0,
  bytesTotal: 0,
  progress: 0,
  videoId: null,
  error: null,
};

/** Mirrors the entry `tus.Upload#findPreviousUploads` returns (the type itself is not exported). */
interface ResumePoint {
  size: number | null;
  metadata: Record<string, string>;
  creationTime: string;
  urlStorageKey: string;
  uploadUrl: string | null;
  parallelUploadUrls: string[] | null;
}

@Service()
export class VideosTusUploadService {
  // Bunny Stream TUS endpoint
  // private readonly TUS_ENDPOINT = '/tus';
  private readonly TUS_ENDPOINT = environment.tusUploadEndpoint;
  private readonly RETRY_DELAYS = [0, 3_000, 5_000, 10_000, 20_000, 60_000];
  private readonly endpoint = `${environment.apiUrl}/videos/prepare-upload`;
  private readonly RESUME_STORAGE_PREFIX = 'prisma:video-upload:';
  private readonly httpClient = inject(HttpClient);

  private readonly state = signal<VideoUploadState>({ ...IDLE_STATE });

  private upload: tus.Upload | null = null;
  private resumeKey: string | null = null;

  // Settles the promise returned by uploadVideo when the upload is cancelled or reset
  private pendingUpload: ((error: unknown) => void) | null = null;

  // Bumped on every new upload, cancel, or reset so stale async work can be ignored
  private generation = 0;

  public readonly status = computed(() => this.state().status);
  public readonly progress = computed(() => this.state().progress);
  public readonly bytesUploaded = computed(() => this.state().bytesUploaded);
  public readonly bytesTotal = computed(() => this.state().bytesTotal);
  public readonly videoId = computed(() => this.state().videoId);
  public readonly error = computed(() => this.state().error);

  public readonly isActive = computed(() => {
    const status = this.state().status;
    return status === 'preparing' || status === 'uploading' || status === 'paused';
  });

  public readonly canPause = computed(() => this.state().status === 'uploading');
  public readonly canResume = computed(() => this.state().status === 'paused');

  // /**
  //  * Creates (or re-signs) a Bunny video object and returns the TUS credentials.
  //  * Pass `existingvideoId` to continue an interrupted upload instead of creating a new video.
  //  */
  // public prepareUploadLink(
  //   request: PrepareUploadVideoLinkRequest,
  // ): Observable<PrepareUploadVideoLinkResponse> {
  //   return this.httpClient.post<PrepareUploadVideoLinkResponse>(this.endpoint, request);
  // }

  /**
   * Uploads `file` straight to Bunny Stream through TUS.
   * Resolves with the video id once Bunny confirms the whole file, rejects with the upload error.
   */
  public async uploadVideo(
    file: File,
    credentials: TusVideoUploadCredentials,
    options: UploadVideoOptions = {},
  ): Promise<string> {
    if (!tus.isSupported) {
      throw new Error('Resumable uploads are not supported by this browser.');
    }

    if (this.isActive()) {
      throw new Error('Another video upload is already in progress.');
    }

    const title = options.title ?? file.name;
    const resumeKey = this.createResumeKey(file);
    const saved = options.resume === false ? null : this.readResumeRecord(resumeKey);
    const generation = ++this.generation;

    this.upload = null;
    this.resumeKey = resumeKey;
    this.state.set({ ...IDLE_STATE, status: 'preparing', bytesTotal: file.size });

    try {
      if (generation !== this.generation) {
        throw new Error('Upload cancelled.');
      }

      // A stored upload URL belongs to a single video, so only reuse it when the API re-signed that video.
      const resumableUrl = saved?.videoId === credentials.videoId ? saved.uploadUrl : null;
      this.state.update((state) => ({ ...state, videoId: credentials.videoId }));

      return await this.startUpload(file, credentials, resumableUrl, title, options, generation);
    } catch (error) {
      // A cancel/reset already moved the state on; don't overwrite it with this stale failure.
      if (generation === this.generation) {
        this.upload = null;
        this.failUpload(error);
      }
      throw error;
    }
  }

  /** Stops the running upload, keeping its progress so {@link resume} can continue it. */
  public async pause(): Promise<void> {
    if (!this.upload || this.state().status !== 'uploading') return;

    await this.upload.abort(false);
    this.state.update((state) => ({ ...state, status: 'paused' }));
  }

  /** Continues a paused upload from the last acknowledged chunk. */
  public resume(): void {
    if (!this.upload || this.state().status !== 'paused') return;

    this.state.update((state) => ({ ...state, status: 'uploading', error: null }));
    this.upload.start();
  }

  /**
   * Aborts the upload and terminates its TUS upload resource on Bunny Stream.
   * The video object created by `prepare-upload` is not deleted here — removing it from the
   * library is a separate backend operation.
   */
  public async cancel(): Promise<void> {
    const upload = this.upload;
    const settle = this.pendingUpload;
    this.upload = null;
    this.pendingUpload = null;
    this.generation++;

    if (this.resumeKey) this.clearResumeRecord(this.resumeKey);
    if (upload) {
      try {
        await upload.abort(true);
      } catch {
        // The upload may not have a server-side resource yet; nothing left to terminate.
      }
    }

    this.state.update((state) => ({
      ...state,
      status: 'cancelled',
      bytesUploaded: 0,
      progress: 0,
    }));

    settle?.(new Error('Upload cancelled.'));
  }

  /** Clears the tracked upload state, aborting a running upload but keeping any video already stored on Bunny. */
  public reset(): void {
    const upload = this.upload;
    const settle = this.pendingUpload;
    this.upload = null;
    this.pendingUpload = null;
    this.resumeKey = null;
    this.generation++;

    if (upload) {
      upload.abort(true).catch(() => undefined);
    }

    this.state.set({ ...IDLE_STATE });
    settle?.(new Error('Upload cancelled.'));
  }

  private startUpload(
    file: File,
    credentials: PrepareUploadVideoLinkResponse,
    resumableUrl: string | null,
    title: string,
    options: UploadVideoOptions,
    generation: number,
  ): Promise<string> {
    const resumeKey = this.resumeKey;
    // Callbacks of an upload that was cancelled or replaced must never touch the current state.
    const isCurrent = () => generation === this.generation;

    return new Promise<string>((resolve, reject) => {
      const upload = new tus.Upload(file, {
        endpoint: this.TUS_ENDPOINT,
        // Resume directly from the URL of the video we just re-signed; if the server no longer
        // knows it, tus creates a fresh upload resource under the same endpoint automatically.
        uploadUrl: resumableUrl,
        retryDelays: this.RETRY_DELAYS,
        removeFingerprintOnSuccess: true,
        headers: {
          AuthorizationSignature: credentials.signature,
          AuthorizationExpire: String(credentials.expirationTime),
          videoId: credentials.videoId,
          LibraryId: String(credentials.libraryId),
        },
        metadata: {
          filetype: file.type || 'video/mp4',
          title,
          ...options.metadata,
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          if (!isCurrent()) return;

          this.state.update((state) => ({
            ...state,
            status: 'uploading',
            bytesUploaded,
            bytesTotal,
            progress: bytesTotal > 0 ? Math.round((bytesUploaded / bytesTotal) * 100) : 0,
          }));
        },
        onUploadUrlAvailable: () => {
          if (!isCurrent() || !upload.url || !resumeKey) return;

          this.writeResumeRecord(resumeKey, {
            videoId: credentials.videoId,
            uploadUrl: upload.url,
          });
        },
        onSuccess: () => {
          if (!isCurrent()) {
            reject(new Error('Upload cancelled.'));
            return;
          }

          this.pendingUpload = null;
          if (resumeKey) this.clearResumeRecord(resumeKey);
          this.upload = null;
          this.state.update((state) => ({
            ...state,
            status: 'success',
            bytesUploaded: state.bytesTotal,
            progress: 100,
            error: null,
          }));
          resolve(credentials.videoId);
        },
        onError: (error) => {
          if (!isCurrent()) {
            reject(error);
            return;
          }

          this.pendingUpload = null;
          if (resumeKey && this.isExpiredUpload(error)) this.clearResumeRecord(resumeKey);
          this.upload = null;
          this.failUpload(error);
          reject(error);
        },
        onShouldRetry: (error, retryAttempt) => {
          if (!isCurrent()) return false;

          const status = error.originalResponse?.getStatus() ?? 0;
          // 4xx (except the temporary 409/423 conflicts) never fixes itself, e.g. a bad signature.
          const permanentClientError =
            status >= 400 && status < 500 && status !== 409 && status !== 423;

          return !permanentClientError && retryAttempt < this.RETRY_DELAYS.length;
        },
      });

      this.upload = upload;
      this.pendingUpload = reject;
      this.state.update((state) => ({ ...state, status: 'uploading', error: null }));

      const start = async (): Promise<void> => {
        if (resumableUrl) {
          // When tus still has the URL-storage entry for this file, resume through it explicitly
          // so tus also tracks the storage key; otherwise the `uploadUrl` option above is used.
          const previousUpload = await this.findPreviousUpload(upload, resumableUrl);
          if (!isCurrent()) throw new Error('Upload cancelled.');

          if (previousUpload) upload.resumeFromPreviousUpload(previousUpload);
        }

        if (!isCurrent()) throw new Error('Upload cancelled.');

        upload.start();
      };

      void start().catch((error: unknown) => {
        // A cancel/reset already moved the state on; keep its state instead of reporting an error.
        if (!isCurrent()) {
          reject(error);
          return;
        }

        this.pendingUpload = null;
        this.upload = null;
        this.failUpload(error);
        reject(error);
      });
    });
  }

  /**
   * Returns the URL-storage entry tus stored for this exact upload URL, or `null` when the browser
   * cannot store URLs or the entry is gone (private browsing, cleared storage, another device).
   */
  private async findPreviousUpload(
    upload: tus.Upload,
    resumableUrl: string,
  ): Promise<ResumePoint | null> {
    if (!tus.canStoreURLs) return null;

    try {
      const previousUploads = await upload.findPreviousUploads();
      return previousUploads.find((previous) => previous.uploadUrl === resumableUrl) ?? null;
    } catch {
      // URL storage is best effort; the `uploadUrl` option still resumes from the saved URL.
      return null;
    }
  }

  private failUpload(error: unknown): void {
    this.state.update((state) => ({
      ...state,
      status: 'error',
      error: this.describeError(error),
    }));
  }

  private describeError(error: unknown): string {
    if (error instanceof tus.DetailedError) {
      switch (error.originalResponse?.getStatus()) {
        case 401:
          return 'The upload authorization is invalid or has expired. Please try again.';
        case 404:
        case 410:
          return 'The previous upload session has expired. Please start the upload again.';
        default:
          return error.message;
      }
    }

    return error instanceof Error ? error.message : 'Video upload failed.';
  }

  private isExpiredUpload(error: unknown): boolean {
    if (!(error instanceof tus.DetailedError)) return false;

    const status = error.originalResponse?.getStatus();
    return status === 404 || status === 410;
  }

  private createResumeKey(file: File): string {
    return `${this.RESUME_STORAGE_PREFIX}${file.name}:${file.size}:${file.lastModified}`;
  }

  private readResumeRecord(key: string): ResumeRecord | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      const record: unknown = JSON.parse(raw);
      if (
        typeof record === 'object' &&
        record !== null &&
        'videoId' in record &&
        'uploadUrl' in record &&
        typeof record.videoId === 'string' &&
        typeof record.uploadUrl === 'string'
      ) {
        return { videoId: record.videoId, uploadUrl: record.uploadUrl };
      }
    } catch {
      // Corrupt or unavailable storage: fall back to a fresh upload.
    }

    return null;
  }

  private writeResumeRecord(key: string, record: ResumeRecord): void {
    try {
      localStorage.setItem(key, JSON.stringify(record));
    } catch {
      // Storage can be full or disabled; the upload still works, it just cannot be resumed after a reload.
    }
  }

  private clearResumeRecord(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore: an unusable storage entry cannot be resumed anyway.
    }
  }
}
