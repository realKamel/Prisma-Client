/** Must match `Bookmark.MaxPerSection` on the backend. */
export const MAX_BOOKMARKS_PER_SECTION = 20;

/** Must match `Bookmark.MaxNoteLength` on the backend. */
export const MAX_BOOKMARK_NOTE_LENGTH = 120;

export interface Bookmark {
  /** The bookmark's PublicId (Guid), not the internal int id. */
  id: string;
  /** Whole seconds into the section's video. */
  positionSeconds: number;
  note: string | null;
  createdAt: string; // DateTimeOffset
}

export interface CreateBookmarkRequest {
  positionSeconds: number;
  note: string | null;
}

export interface UpdateBookmarkNoteRequest {
  note: string | null;
}

/** 75 → "1:15", 3725 → "1:02:05". */
export function formatBookmarkTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const ss = String(Math.floor(totalSeconds % 60)).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}