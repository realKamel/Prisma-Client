import { Service, signal } from '@angular/core';
import { UploadStatus } from './file-upload.model';

@Service()
export class FileUploadService {
  private xhr: XMLHttpRequest | null = null;

  // Private writable signals
  private _progress = signal<number>(0);
  private _status = signal<UploadStatus>('idle');

  // Public read-only signals for templates
  public readonly progress = this._progress.asReadonly();
  public readonly status = this._status.asReadonly();

  /**
   * Uploads a file straight to a pre-signed URL using XHR with signals.
   */
  public upload(url: string, file: File): void {
    // Abort any ongoing upload
    this.cancel();

    this._progress.set(0);
    this._status.set('uploading');

    this.xhr = new XMLHttpRequest();
    this.xhr.open('PUT', url, true);
    this.xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

    // Track upload progress
    if (this.xhr.upload) {
      this.xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded * 100) / event.total);
          this._progress.set(percent);
        }
      };
    }

    // Handle successful completion
    this.xhr.onload = () => {
      if (this.xhr && this.xhr.status >= 200 && this.xhr.status < 300) {
        this._progress.set(100);
        this._status.set('completed');
      } else {
        this._status.set('error');
      }
      this.xhr = null;
    };

    // Handle network errors
    this.xhr.onerror = () => {
      this._status.set('error');
      this.xhr = null;
    };

    // Send payload
    this.xhr.send(file);
  }

  /**
   * Cancels the active upload immediately.
   */
  public cancel(): void {
    if (this.xhr) {
      this.xhr.abort();
      this.xhr = null;
      this._status.set('error');
    }
  }
}
