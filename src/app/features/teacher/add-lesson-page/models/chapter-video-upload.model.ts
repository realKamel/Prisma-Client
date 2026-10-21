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
  /** Bunny Stream video id, set once the TUS upload finishes. */
  videoId: string | null;
  /** Whether the uploaded video has been linked to its lesson section. */
  attached: boolean;
  error: string | null;
}

export const createChapterVideoUpload = (): ChapterVideoUpload => ({
  file: null,
  durationSeconds: 0,
  status: 'ready',
  progress: 0,
  bytesUploaded: 0,
  bytesTotal: 0,
  videoId: null,
  attached: false,
  error: null,
});
