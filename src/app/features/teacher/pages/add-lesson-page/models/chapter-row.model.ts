import { ChapterVideoUpload, createChapterVideoUpload } from './chapter-video-upload.model';

/** One chapter of the videos step: a title, its server section and the upload state of its video. */
export interface ChapterRow {
  /** Stable identity for `@for` tracking, so rows keep their DOM when others are removed. */
  key: string;
  name: string;
  /** Section id returned once the section exists on the server; a video can't be linked before it. */
  sectionId: number | null;
  upload: ChapterVideoUpload;
}

export const createChapterRow = (name = ''): ChapterRow => ({
  key: crypto.randomUUID(),
  name,
  sectionId: null,
  upload: createChapterVideoUpload(),
});
