import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import * as tus from 'tus-js-client';
import { environment } from '../../../../../environments/environment';
import { PrepareUploadVideoLinkResponse } from './videos.models';
import { VideosService } from './videos.service';

interface FakeUploadOptions {
  endpoint?: string | null;
  uploadUrl?: string | null;
  headers?: Record<string, string>;
  metadata?: Record<string, string>;
  onUploadUrlAvailable?: (() => void) | null;
  onProgress?: ((bytesSent: number, bytesTotal: number) => void) | null;
  onSuccess?: (() => void) | null;
  onError?: ((error: Error) => void) | null;
}

interface FakePreviousUpload {
  size: number | null;
  metadata: Record<string, string>;
  creationTime: string;
  urlStorageKey: string;
  uploadUrl: string | null;
  parallelUploadUrls: string[] | null;
}

interface FakeUpload {
  url: string | null;
  options: FakeUploadOptions;
  start: () => void;
  abort: () => Promise<void>;
  findPreviousUploads: () => Promise<FakePreviousUpload[]>;
  resumeFromPreviousUpload: (previous: FakePreviousUpload) => void;
}

const tusMock = vi.hoisted(() => ({
  supported: true,
  canStore: true,
  uploads: [] as FakeUpload[],
  previousUploads: [] as FakePreviousUpload[],
}));

vi.mock('tus-js-client', () => {
  class Upload implements FakeUpload {
    public url: string | null = null;
    public readonly options: FakeUploadOptions;
    public readonly start = vi.fn(() => {
      this.url = 'https://video.bunnycdn.com/tusupload/upload-1';
      this.options.onUploadUrlAvailable?.();
    });
    public readonly abort = vi.fn(async () => undefined);
    public readonly findPreviousUploads = vi.fn(async () => tusMock.previousUploads);
    public readonly resumeFromPreviousUpload = vi.fn((previous: FakePreviousUpload) => {
      this.url = previous.uploadUrl;
    });

    constructor(_file: File, options: FakeUploadOptions) {
      this.options = options;
      tusMock.uploads.push(this);
    }

    public static readonly terminate = vi.fn(async () => undefined);
  }

  class DetailedError extends Error {
    public originalResponse: { getStatus(): number } | null = null;
  }

  return {
    Upload,
    DetailedError,
    get isSupported() {
      return tusMock.supported;
    },
    get canStoreURLs() {
      return tusMock.canStore;
    },
  };
});

function createFile(name = 'lesson.mp4'): File {
  return new File(['video-bytes'], name, { type: 'video/mp4', lastModified: 1_700_000_000_000 });
}

function credentialsFor(videoId: string): PrepareUploadVideoLinkResponse {
  return {
    VideoId: videoId,
    LibraryId: 42,
    ExpirationTime: 1_700_000_000,
    Signature: 'signature',
  };
}

function resumeKeyFor(file: File): string {
  return `prisma:video-upload:${file.name}:${file.size}:${file.lastModified}`;
}

function createStorageMock(): Storage {
  const items = new Map<string, string>();

  return {
    get length() {
      return items.size;
    },
    clear: () => items.clear(),
    getItem: (key) => items.get(key) ?? null,
    key: (index) => [...items.keys()][index] ?? null,
    removeItem: (key) => items.delete(key),
    setItem: (key, value) => items.set(key, value),
  };
}

describe('VideosService', () => {
  let service: VideosService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorageMock());
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(VideosService);
    httpTesting = TestBed.inject(HttpTestingController);

    tusMock.supported = true;
    tusMock.canStore = true;
    tusMock.uploads.length = 0;
    tusMock.previousUploads = [];
    localStorage.clear();
  });

  afterEach(() => {
    httpTesting.verify();
    vi.unstubAllGlobals();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.status()).toBe('idle');
    expect(service.progress()).toBe(0);
  });

  it('requests TUS credentials with the given title and existing video id', () => {
    const credentials = credentialsFor('video-1');
    let received: PrepareUploadVideoLinkResponse | undefined;

    service
      .prepareUploadLink({ title: 'lesson.mp4', existingVideoId: 'video-1' })
      .subscribe((response) => (received = response));

    const request = httpTesting.expectOne(`${environment.apiUrl}/videos/prepare-upload`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ title: 'lesson.mp4', existingVideoId: 'video-1' });

    request.flush(credentials);

    expect(received).toEqual(credentials);
  });

  it('uploads the file through TUS with the signed credentials and tracks progress', async () => {
    const file = createFile();
    const uploadPromise = service.uploadVideo(file, { title: 'Lesson 1' });

    httpTesting
      .expectOne(`${environment.apiUrl}/videos/prepare-upload`)
      .flush(credentialsFor('video-1'));
    await vi.waitFor(() => expect(tusMock.uploads.length).toBe(1));

    const upload = tusMock.uploads[0];
    expect(upload.options.endpoint).toBe('https://video.bunnycdn.com/tusupload');
    expect(upload.options.headers).toEqual({
      AuthorizationSignature: 'signature',
      AuthorizationExpire: '1700000000',
      VideoId: 'video-1',
      LibraryId: '42',
    });
    expect(upload.options.metadata).toEqual({ filetype: 'video/mp4', title: 'Lesson 1' });
    expect(upload.start).toHaveBeenCalled();
    expect(upload.resumeFromPreviousUpload).not.toHaveBeenCalled();
    expect(service.status()).toBe('uploading');

    upload.options.onProgress?.(512, 1024);
    expect(service.bytesUploaded()).toBe(512);
    expect(service.bytesTotal()).toBe(1024);
    expect(service.progress()).toBe(50);

    upload.options.onSuccess?.();
    await expect(uploadPromise).resolves.toBe('video-1');
    expect(service.status()).toBe('success');
    expect(service.progress()).toBe(100);
  });

  it('re-signs a stored video and resumes the previous upload explicitly', async () => {
    const file = createFile();
    const resumeKey = resumeKeyFor(file);
    const uploadUrl = 'https://video.bunnycdn.com/tusupload/previous';
    const previousUpload: FakePreviousUpload = {
      size: file.size,
      metadata: { filetype: 'video/mp4', title: file.name },
      creationTime: '2026-10-21T00:00:00.000Z',
      urlStorageKey: 'tus::fingerprint::1',
      uploadUrl,
      parallelUploadUrls: null,
    };
    localStorage.setItem(resumeKey, JSON.stringify({ videoId: 'video-1', uploadUrl }));
    tusMock.previousUploads = [previousUpload];

    const uploadPromise = service.uploadVideo(file);

    const request = httpTesting.expectOne(`${environment.apiUrl}/videos/prepare-upload`);
    expect(request.request.body).toEqual({ title: file.name, existingVideoId: 'video-1' });
    request.flush(credentialsFor('video-1'));

    await vi.waitFor(() => expect(tusMock.uploads.length).toBe(1));
    const upload = tusMock.uploads[0];
    await vi.waitFor(() => expect(upload.start).toHaveBeenCalled());

    expect(upload.options.uploadUrl).toBe(uploadUrl);
    expect(upload.findPreviousUploads).toHaveBeenCalled();
    expect(upload.resumeFromPreviousUpload).toHaveBeenCalledWith(previousUpload);

    upload.options.onSuccess?.();
    await expect(uploadPromise).resolves.toBe('video-1');
    expect(localStorage.getItem(resumeKey)).toBeNull();
  });

  it('resumes an interrupted upload after a full page reload', async () => {
    const file = createFile();
    const resumeKey = resumeKeyFor(file);

    // First page load: the upload starts and its video id + TUS URL are persisted.
    const interrupted = service.uploadVideo(file);
    httpTesting
      .expectOne(`${environment.apiUrl}/videos/prepare-upload`)
      .flush(credentialsFor('video-1'));
    await vi.waitFor(() => expect(tusMock.uploads.length).toBe(1));
    await vi.waitFor(() => expect(tusMock.uploads[0].start).toHaveBeenCalled());

    const saved = JSON.parse(localStorage.getItem(resumeKey) ?? 'null') as {
      videoId: string;
      uploadUrl: string;
    };
    expect(saved).toEqual({
      videoId: 'video-1',
      uploadUrl: 'https://video.bunnycdn.com/tusupload/upload-1',
    });

    // Second page load: a brand-new service instance (fresh injector) sharing the same storage.
    const firstPageService = service;
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(VideosService);
    httpTesting = TestBed.inject(HttpTestingController);
    tusMock.previousUploads = [
      {
        size: file.size,
        metadata: { filetype: 'video/mp4', title: file.name },
        creationTime: '2026-10-21T00:00:00.000Z',
        urlStorageKey: 'tus::fingerprint::1',
        uploadUrl: saved.uploadUrl,
        parallelUploadUrls: null,
      },
    ];

    const resumed = service.uploadVideo(file);

    const request = httpTesting.expectOne(`${environment.apiUrl}/videos/prepare-upload`);
    expect(request.request.body).toEqual({ title: file.name, existingVideoId: 'video-1' });
    request.flush(credentialsFor('video-1'));

    await vi.waitFor(() => expect(tusMock.uploads.length).toBe(2));
    const resumedUpload = tusMock.uploads[1];
    await vi.waitFor(() => expect(resumedUpload.start).toHaveBeenCalled());
    expect(resumedUpload.options.uploadUrl).toBe(saved.uploadUrl);
    expect(resumedUpload.resumeFromPreviousUpload).toHaveBeenCalledWith(tusMock.previousUploads[0]);

    resumedUpload.options.onSuccess?.();
    await expect(resumed).resolves.toBe('video-1');

    // The abandoned first-page promise is never left dangling.
    await firstPageService.cancel();
    await expect(interrupted).rejects.toThrow('Upload cancelled.');
  });

  it('resumes from the saved URL when the browser cannot store tus URLs', async () => {
    const file = createFile();
    const resumeKey = resumeKeyFor(file);
    const uploadUrl = 'https://video.bunnycdn.com/tusupload/previous';
    localStorage.setItem(resumeKey, JSON.stringify({ videoId: 'video-1', uploadUrl }));
    tusMock.canStore = false;

    const uploadPromise = service.uploadVideo(file);

    httpTesting
      .expectOne(`${environment.apiUrl}/videos/prepare-upload`)
      .flush(credentialsFor('video-1'));
    await vi.waitFor(() => expect(tusMock.uploads.length).toBe(1));
    const upload = tusMock.uploads[0];
    await vi.waitFor(() => expect(upload.start).toHaveBeenCalled());

    expect(upload.findPreviousUploads).not.toHaveBeenCalled();
    expect(upload.resumeFromPreviousUpload).not.toHaveBeenCalled();
    expect(upload.options.uploadUrl).toBe(uploadUrl);

    upload.options.onSuccess?.();
    await expect(uploadPromise).resolves.toBe('video-1');
  });

  it('starts a new upload when the API re-signs a different video than the stored one', async () => {
    const file = createFile();
    const resumeKey = resumeKeyFor(file);
    const staleUploadUrl = 'https://video.bunnycdn.com/tusupload/previous';
    localStorage.setItem(
      resumeKey,
      JSON.stringify({ videoId: 'stale-video', uploadUrl: staleUploadUrl }),
    );
    tusMock.previousUploads = [
      {
        size: file.size,
        metadata: { filetype: 'video/mp4', title: file.name },
        creationTime: '2026-10-21T00:00:00.000Z',
        urlStorageKey: 'tus::fingerprint::1',
        uploadUrl: staleUploadUrl,
        parallelUploadUrls: null,
      },
    ];

    const uploadPromise = service.uploadVideo(file);

    const request = httpTesting.expectOne(`${environment.apiUrl}/videos/prepare-upload`);
    expect(request.request.body).toEqual({ title: file.name, existingVideoId: 'stale-video' });
    // The API could not re-sign the stored video, so it created a new one.
    request.flush(credentialsFor('video-2'));

    await vi.waitFor(() => expect(tusMock.uploads.length).toBe(1));
    const upload = tusMock.uploads[0];
    await vi.waitFor(() => expect(upload.start).toHaveBeenCalled());

    expect(upload.options.uploadUrl).toBeNull();
    expect(upload.resumeFromPreviousUpload).not.toHaveBeenCalled();

    upload.options.onSuccess?.();
    await expect(uploadPromise).resolves.toBe('video-2');
    expect(localStorage.getItem(resumeKey)).toBeNull();
  });

  it('reports an expired upload session and drops the stale resume entry', async () => {
    const file = createFile();
    const resumeKey = resumeKeyFor(file);
    localStorage.setItem(
      resumeKey,
      JSON.stringify({
        videoId: 'video-1',
        uploadUrl: 'https://video.bunnycdn.com/tusupload/previous',
      }),
    );

    const uploadPromise = service.uploadVideo(file);

    httpTesting
      .expectOne(`${environment.apiUrl}/videos/prepare-upload`)
      .flush(credentialsFor('video-1'));
    await vi.waitFor(() => expect(tusMock.uploads.length).toBe(1));
    const upload = tusMock.uploads[0];
    await vi.waitFor(() => expect(upload.start).toHaveBeenCalled());
    expect(upload.options.uploadUrl).toBe('https://video.bunnycdn.com/tusupload/previous');
    expect(upload.resumeFromPreviousUpload).not.toHaveBeenCalled();

    const error = new tus.DetailedError('Request failed with status 404');
    Object.assign(error, { originalResponse: { getStatus: () => 404 } });
    upload.options.onError?.(error);

    await expect(uploadPromise).rejects.toBe(error);
    expect(service.status()).toBe('error');
    expect(service.error()).toBe(
      'The previous upload session has expired. Please start the upload again.',
    );
    expect(localStorage.getItem(resumeKey)).toBeNull();
  });

  it('rejects a second upload while one is already running', async () => {
    const file = createFile();
    const uploadPromise = service.uploadVideo(file);
    httpTesting
      .expectOne(`${environment.apiUrl}/videos/prepare-upload`)
      .flush(credentialsFor('video-1'));
    await vi.waitFor(() => expect(tusMock.uploads.length).toBe(1));

    await expect(service.uploadVideo(createFile('other.mp4'))).rejects.toThrow(
      'Another video upload is already in progress.',
    );

    tusMock.uploads[0].options.onSuccess?.();
    await uploadPromise;
  });

  it('pauses and resumes the running upload', async () => {
    const uploadPromise = service.uploadVideo(createFile());
    httpTesting
      .expectOne(`${environment.apiUrl}/videos/prepare-upload`)
      .flush(credentialsFor('video-1'));
    await vi.waitFor(() => expect(tusMock.uploads.length).toBe(1));
    const upload = tusMock.uploads[0];

    await service.pause();
    expect(upload.abort).toHaveBeenCalledWith(false);
    expect(service.status()).toBe('paused');
    expect(service.canPause()).toBe(false);
    expect(service.canResume()).toBe(true);

    service.resume();
    expect(service.status()).toBe('uploading');
    expect(upload.start).toHaveBeenCalledTimes(2);

    upload.options.onSuccess?.();
    await expect(uploadPromise).resolves.toBe('video-1');
  });

  it('ignores credentials that arrive after the upload was cancelled', async () => {
    const uploadPromise = service.uploadVideo(createFile());

    await service.cancel();
    expect(service.status()).toBe('cancelled');

    httpTesting
      .expectOne(`${environment.apiUrl}/videos/prepare-upload`)
      .flush(credentialsFor('video-1'));

    await expect(uploadPromise).rejects.toThrow('Upload cancelled.');
    expect(service.status()).toBe('cancelled');
    expect(tusMock.uploads.length).toBe(0);
  });

  it('ignores TUS callbacks from an upload that was cancelled', async () => {
    const uploadPromise = service.uploadVideo(createFile());
    httpTesting
      .expectOne(`${environment.apiUrl}/videos/prepare-upload`)
      .flush(credentialsFor('video-1'));
    await vi.waitFor(() => expect(tusMock.uploads.length).toBe(1));
    const cancelledUpload = tusMock.uploads[0];
    await vi.waitFor(() => expect(cancelledUpload.start).toHaveBeenCalled());

    await service.cancel();
    await expect(uploadPromise).rejects.toThrow('Upload cancelled.');

    // Late events of the aborted upload must not resurrect its progress, error, or resume entry.
    cancelledUpload.options.onProgress?.(900, 1000);
    cancelledUpload.options.onUploadUrlAvailable?.();
    cancelledUpload.options.onError?.(new Error('late failure'));

    expect(service.status()).toBe('cancelled');
    expect(service.progress()).toBe(0);
    expect(service.error()).toBeNull();
    expect(localStorage.length).toBe(0);
  });
});
