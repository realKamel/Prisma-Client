import { ChapterVideoUpload, createChapterVideoUpload } from './chapter-video-upload.model';

/** One chapter of the videos step: a title, its server section and the upload state of its video. */
export interface ChapterRow {
  /** Stable identity for `@for` tracking, so rows keep their DOM when others are removed. */
  key: string;
  name: string;
  /** Section id (Guid) returned when the section is created; a video can't be uploaded before it. */
  sectionId: string | null;
  /** Video created together with the section and attached to it; its upload link is renewed if needed. */
  videoId: string | null;
  upload: ChapterVideoUpload;
}

export const createChapterRow = (name = ''): ChapterRow => ({
  key: crypto.randomUUID(),
  name,
  sectionId: null,
  videoId: null,
  upload: createChapterVideoUpload(),
});
