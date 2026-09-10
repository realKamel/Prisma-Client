import { TestBed } from '@angular/core/testing';
import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { throwError } from 'rxjs';
import { toast } from 'ngx-sonner';

import { errorInterceptorInterceptor } from './error-interceptor-interceptor';

describe('errorInterceptorInterceptor', () => {
  const translations: Record<string, string> = {
    'COMMON.ERRORS.NETWORK_ERROR': 'Network error, please check your connection.',
    'COMMON.ERRORS.NOT_FOUND': 'The requested resource could not be found.',
    'COMMON.ERRORS.UNEXPECTED_ERROR': 'An unexpected error occurred.',
    'COMMON.ERRORS.EMAIL_TAKEN': 'This email is already registered.',
  };

  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => errorInterceptorInterceptor(req, next));

  const req = new HttpRequest('GET', '/api/test');

  const nextThatThrows =
    (error: HttpErrorResponse): HttpHandlerFn =>
    () =>
      throwError(() => error);

  const runAndCapture = (error: HttpErrorResponse): Promise<HttpErrorResponse> =>
    new Promise((resolve, reject) => {
      interceptor(req, nextThatThrows(error)).subscribe({
        next: () => reject(new Error('expected the interceptor to rethrow the error')),
        error: (thrown) => resolve(thrown),
      });
    });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: TranslateService,
          useValue: {
            instant: (key: string) => translations[key] ?? key,
          },
        },
      ],
    });

    vi.spyOn(toast, 'error').mockImplementation(() => '');
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('toasts the translated network-error message when status is 0', async () => {
    const error = new HttpErrorResponse({ status: 0, statusText: 'Unknown Error' });

    await runAndCapture(error);

    expect(toast.error).toHaveBeenCalledWith(translations['COMMON.ERRORS.NETWORK_ERROR']);
  });

  it('toasts the raw client-side ErrorEvent message without translating it', async () => {
    const clientError = new ErrorEvent('offline', { message: 'Client went offline' });
    const error = new HttpErrorResponse({
      error: clientError,
      status: 0,
      statusText: 'Unknown Error',
    });

    await runAndCapture(error);

    expect(toast.error).toHaveBeenCalledWith('Client went offline');
  });

  it('rethrows 400 field-validation errors without toasting so the form can handle them', async () => {
    const error = new HttpErrorResponse({
      error: { title: 'Validation failed', errors: { email: ['Email is invalid'] } },
      status: 400,
      statusText: 'Bad Request',
    });

    const thrown = await runAndCapture(error);

    expect(thrown).toBe(error);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('uses the translated message when the backend `code` matches a translation key', async () => {
    const error = new HttpErrorResponse({
      error: { code: 'EMAIL_TAKEN', detail: 'raw detail should be ignored' },
      status: 409,
      statusText: 'Conflict',
    });

    await runAndCapture(error);

    expect(toast.error).toHaveBeenCalledWith(translations['COMMON.ERRORS.EMAIL_TAKEN']);
  });

  it('falls back to the human-friendly `detail` when `code` has no matching translation', async () => {
    const error = new HttpErrorResponse({
      error: { code: 'UNKNOWN_CODE', detail: 'A human friendly detail message' },
      status: 409,
      statusText: 'Conflict',
    });

    await runAndCapture(error);

    expect(toast.error).toHaveBeenCalledWith('A human friendly detail message');
  });

  it('falls back to `title` when there is no `code` or `detail`', async () => {
    const error = new HttpErrorResponse({
      error: { title: 'A human friendly title message' },
      status: 409,
      statusText: 'Conflict',
    });

    await runAndCapture(error);

    expect(toast.error).toHaveBeenCalledWith('A human friendly title message');
  });

  it('falls back to a generic status-based message when the backend gives no usable message', async () => {
    const error = new HttpErrorResponse({ error: {}, status: 404, statusText: 'Not Found' });

    await runAndCapture(error);

    expect(toast.error).toHaveBeenCalledWith(translations['COMMON.ERRORS.NOT_FOUND']);
  });

  it('falls back to the unexpected-error message for unmapped status codes', async () => {
    const error = new HttpErrorResponse({ error: {}, status: 418, statusText: "I'm a teapot" });

    await runAndCapture(error);

    expect(toast.error).toHaveBeenCalledWith(translations['COMMON.ERRORS.UNEXPECTED_ERROR']);
  });

  it('always rethrows the original error so downstream subscribers can react to it', async () => {
    const error = new HttpErrorResponse({ error: {}, status: 500, statusText: 'Server Error' });

    const thrown = await runAndCapture(error);

    expect(thrown).toBe(error);
  });
});
