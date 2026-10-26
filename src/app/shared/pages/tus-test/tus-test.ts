import { Component, computed, OnDestroy, signal } from '@angular/core';
import * as tus from 'tus-js-client';

type TestStatus = 'idle' | 'uploading' | 'paused' | 'success' | 'cancelled' | 'error';

/**
 * Scratch harness for the test TUS endpoint. It talks to tus-js-client directly — no
 * `prepare-upload` call, no signature — so the resumable upload protocol itself can be exercised:
 * start, pause, resume, cancel, plus retries and error reporting.
 */
@Component({
  selector: 'app-tus-test-page',
  templateUrl: './tus-test.html',
  styleUrl: './tus-test.css',
})
export class TusTestPageComponent implements OnDestroy {
  /** Test TUS endpoint, proxied to the backend by `proxy.conf.json`. */
  private readonly ENDPOINT = 'http://localhost:8080/tus';
  private readonly RETRY_DELAYS = [0, 3_000, 5_000, 10_000];

  protected readonly supported = tus.isSupported;
  protected readonly canStoreUrls = tus.canStoreURLs;

  protected readonly file = signal<File | null>(null);
  protected readonly title = signal('');
  protected readonly status = signal<TestStatus>('idle');
  protected readonly bytesUploaded = signal(0);
  protected readonly bytesTotal = signal(0);
  protected readonly uploadUrl = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly log = signal<string[]>([]);

  protected readonly fileName = computed(() => this.file()?.name ?? 'No file selected');
  protected readonly formattedSize = computed(() => this.formatBytes(this.file()?.size ?? 0));
  protected readonly effectiveTitle = computed(
    () => this.title().trim() || this.file()?.name || 'tus-test',
  );
  protected readonly progress = computed(() => {
    const total = this.bytesTotal();
    return total > 0 ? Math.round((this.bytesUploaded() / total) * 100) : 0;
  });
  protected readonly isActive = computed(() => {
    const status = this.status();
    return status === 'uploading' || status === 'paused';
  });
  protected readonly canStart = computed(() => !!this.file() && !this.isActive());
  protected readonly canPause = computed(() => this.status() === 'uploading');
  protected readonly canResume = computed(() => this.status() === 'paused');
  protected readonly canCancel = computed(() => this.isActive());

  private upload: tus.Upload | null = null;
  private lastLoggedPercent = -10;

  public ngOnDestroy(): void {
    void this.upload?.abort(true).catch(() => undefined);
    this.upload = null;
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selected = input.files?.[0] ?? null;
    input.value = '';

    void this.upload?.abort(false).catch(() => undefined);
    this.upload = null;
    this.file.set(selected);
    this.status.set('idle');
    this.bytesUploaded.set(0);
    this.bytesTotal.set(selected?.size ?? 0);
    this.logLine(
      selected ? `Selected ${selected.name} (${this.formatBytes(selected.size)})` : 'File cleared',
    );
  }

  protected onTitleInput(event: Event): void {
    this.title.set((event.target as HTMLInputElement).value);
  }

  protected clearLog(): void {
    this.log.set([]);
  }

  protected startUpload(): void {
    const file = this.file();
    if (!file) return;

    this.upload = this.createUpload(file);
    this.lastLoggedPercent = -10;
    this.error.set(null);
    this.bytesUploaded.set(0);
    this.bytesTotal.set(file.size);
    this.uploadUrl.set(null);
    this.status.set('uploading');
    this.logLine(`POST ${this.ENDPOINT} — starting ${file.name}`);

    this.upload.start();
  }

  protected async pauseUpload(): Promise<void> {
    if (!this.upload) return;

    this.logLine('abort(false) — pausing');
    await this.upload.abort(false);
    this.status.set('paused');
  }

  protected resumeUpload(): void {
    if (!this.upload) return;

    this.logLine('start() — resuming');
    this.status.set('uploading');
    this.upload.start();
  }

  protected async cancelUpload(): Promise<void> {
    const upload = this.upload;
    this.upload = null;
    if (!upload) return;

    this.logLine('abort(true) — cancelling and deleting the TUS resource');
    try {
      await upload.abort(true);
    } catch (error) {
      this.logLine(`abort failed: ${this.describe(error)}`);
    }
    this.status.set('cancelled');
  }

  protected resetUpload(): void {
    const upload = this.upload;
    this.upload = null;
    if (upload) void upload.abort(true).catch(() => undefined);

    this.logLine('reset() — state cleared');
    this.status.set('idle');
    this.bytesUploaded.set(0);
    this.bytesTotal.set(this.file()?.size ?? 0);
    this.uploadUrl.set(null);
    this.error.set(null);
  }

  private createUpload(file: File): tus.Upload {
    const upload = new tus.Upload(file, {
      endpoint: this.ENDPOINT,
      retryDelays: this.RETRY_DELAYS,
      removeFingerprintOnSuccess: true,
      metadata: {
        filename: file.name,
        filetype: file.type || 'video/mp4',
        title: this.effectiveTitle(),
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        this.bytesUploaded.set(bytesUploaded);
        this.bytesTotal.set(bytesTotal);

        const percent = bytesTotal > 0 ? Math.floor((bytesUploaded / bytesTotal) * 100) : 0;
        if (percent >= this.lastLoggedPercent + 10) {
          this.lastLoggedPercent = percent;
          this.logLine(`progress ${percent}% (${bytesUploaded} / ${bytesTotal} bytes)`);
        }
      },
      onUploadUrlAvailable: () => {
        this.uploadUrl.set(upload.url ?? null);
        this.logLine(`upload url: ${upload.url ?? 'unknown'}`);
      },
      onAfterResponse: (_request, response) => {
        this.logLine(`response ${response.getStatus()}`);
      },
      onShouldRetry: (error, retryAttempt) => {
        const status = error.originalResponse?.getStatus() ?? 0;
        this.logLine(`failure ${status} — retry attempt ${retryAttempt + 1}`);
        return retryAttempt < this.RETRY_DELAYS.length;
      },
      onSuccess: () => {
        this.upload = null;
        this.status.set('success');
        this.logLine(`success — ${this.bytesTotal()} bytes acknowledged`);
      },
      onError: (error) => {
        this.upload = null;
        this.status.set('error');
        this.error.set(this.describe(error));
        this.logLine(`error: ${this.describe(error)}`);
      },
    });

    return upload;
  }

  private describe(error: unknown): string {
    if (error instanceof tus.DetailedError) {
      const status = error.originalResponse?.getStatus();
      const body = error.originalResponse?.getBody() ?? '';
      return `${error.message}${status ? ` (HTTP ${status})` : ''}${body ? ` — ${body}` : ''}`;
    }

    return error instanceof Error ? error.message : String(error);
  }

  private logLine(message: string): void {
    const time = new Date().toLocaleTimeString();
    this.log.update((lines) => [`${time}  ${message}`, ...lines].slice(0, 200));
  }

  private formatBytes(bytes: number): string {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
