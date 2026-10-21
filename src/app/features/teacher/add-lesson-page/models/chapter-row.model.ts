import { ChapterVideoUpload, createChapterVideoUpload } from './chapter-video-upload.model';

/** One chapter of the videos step: a title plus the upload state of its video. */
export interface ChapterRow {
  /** Stable identity for `@for` tracking, so rows keep their DOM when others are removed. */
  key: string;
  name: string;
  upload: ChapterVideoUpload;
}

export const createChapterRow = (name = ''): ChapterRow => ({
  key: crypto.randomUUID(),
  name,
  upload: createChapterVideoUpload(),
});
