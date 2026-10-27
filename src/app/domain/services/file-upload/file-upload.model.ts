import { Signal } from '@angular/core';

export type UploadStatus = 'idle' | 'uploading' | 'completed' | 'error';
export interface UploadTask {
  progress: Signal<number>;
  status: Signal<UploadStatus>;
  cancel: () => void;
}
