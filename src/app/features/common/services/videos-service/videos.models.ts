export interface PrepareUploadVideoLinkRequest {
  title: string;
  /** Existing video GUID to re-sign so an interrupted upload can be resumed. */
  existingVideoId: string | null;
}
export interface ResumeRecord {
  videoId: string;
  uploadUrl: string;
}
export interface PrepareUploadVideoLinkResponse {
  videoId: string;
  libraryId: number;
  expirationTime: number;
  signature: string;
}

export type VideoUploadStatus =
  'idle' | 'preparing' | 'uploading' | 'paused' | 'success' | 'cancelled' | 'error';

export interface VideoUploadState {
  status: VideoUploadStatus;
  bytesUploaded: number;
  bytesTotal: number;
  /** Percentage of the file already uploaded (0-100). */
  progress: number;
  videoId: string | null;
  error: string | null;
}

export interface UploadVideoOptions {
  /** Title stored by Bunny Stream. Defaults to the file name. */
  title?: string;
  /** Resume an interrupted upload of the same file instead of restarting it. Defaults to `true`. */
  resume?: boolean;
  /** Extra TUS metadata, e.g. `collection` or `thumbnailTime` (milliseconds, as a string). */
  metadata?: Record<string, string>;
}
