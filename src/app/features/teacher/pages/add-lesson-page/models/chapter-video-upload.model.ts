import { TusVideoUploadCredentials } from '../../../../../domain/services/videos-service/videos.models';

/** Upload lifecycle of a single chapter video inside the "videos" step. */
export type ChapterVideoStatus = 'ready' | 'uploading' | 'paused' | 'done' | 'error';

export interface ChapterVideoUpload {
  file: File | null;
  /** Duration read from the local file, sent to the backend with the section. */
  durationSeconds: number;
  status: ChapterVideoStatus;
  progress: number;
  bytesUploaded: number;
  bytesTotal: number;
  /** Signed TUS credentials for the chapter's video; renewed through the API once they expire. */
  credentials: TusVideoUploadCredentials | null;
  error: string | null;
}

export const createChapterVideoUpload = (): ChapterVideoUpload => ({
  file: null,
  durationSeconds: 0,
  status: 'ready',
  progress: 0,
  bytesUploaded: 0,
  bytesTotal: 0,
  credentials: null,
  error: null,
});
