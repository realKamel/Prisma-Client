import { Service, signal } from '@angular/core';
import { UploadStatus, UploadTask } from './file-upload.model';

@Service()
export class FileUploadService {
  public upload(url: string, file: File): UploadTask {
    const _progress = signal<number>(0);
    const _status = signal<UploadStatus>('uploading');

    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url, true);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

    // Track upload progress
    if (xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded * 100) / event.total);
          _progress.set(percent);
        }
      };
    }

    // Handle successful completion
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        _progress.set(100);
        _status.set('completed');
      } else {
        _status.set('error');
      }
    };

    // Handle network errors
    xhr.onerror = () => {
      _status.set('error');
    };

    // Send payload
    xhr.send(file);

    // Return task control block with read-only signals
    return {
      progress: _progress.asReadonly(),
      status: _status.asReadonly(),
      cancel: () => {
        xhr.abort();
        _status.set('error');
      },
    };
  }
}
