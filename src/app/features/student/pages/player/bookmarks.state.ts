import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { Observable, Subscription, catchError, defer, map, of } from 'rxjs';
import { Bookmark, MAX_BOOKMARKS_PER_SECTION } from '../../models/bookmark.model';
import { BookmarkService } from '../../services/bookmark.service';

export type AddBookmarkOutcome =
  | { kind: 'added'; bookmark: Bookmark }
  | { kind: 'duplicate' }
  | { kind: 'full' }
  | { kind: 'no-access' }
  | { kind: 'invalid' }
  | { kind: 'error' };

function insertSorted(list: Bookmark[], item: Bookmark): Bookmark[] {
  return [...list, item].sort((a, b) => a.positionSeconds - b.positionSeconds);
}

function toOutcome(err: HttpErrorResponse): AddBookmarkOutcome {
  switch (err.status) {
    case 409:
      return { kind: 'duplicate' };
    case 403:
      return { kind: 'no-access' };
    case 400:
      return { kind: 'invalid' };
    default:
      return { kind: 'error' };
  }
}

/** Bookmarks of the section being watched. Provide it on the lesson player page. */
@Injectable()
export class BookmarksState {
  private readonly api = inject(BookmarkService);

  private readonly _sectionId = signal<number | null>(null);
  private readonly _bookmarks = signal<Bookmark[]>([]);
  private readonly _loading = signal(false);
  private readonly _loadError = signal(false);
  private readonly _lastAddedId = signal<string | null>(null);

  public readonly sectionId = this._sectionId.asReadonly();
  public readonly bookmarks = this._bookmarks.asReadonly();
  public readonly loading = this._loading.asReadonly();
  public readonly loadError = this._loadError.asReadonly();
  /** Set briefly after an add, so the row can flash. */
  public readonly lastAddedId = this._lastAddedId.asReadonly();

  public readonly count = computed(() => this._bookmarks().length);
  public readonly isFull = computed(() => this.count() >= MAX_BOOKMARKS_PER_SECTION);

  private loadSub: Subscription | undefined;
  private flashTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.loadSub?.unsubscribe();
      clearTimeout(this.flashTimer);
    });
  }

  public setSection(sectionId: number | null): void {
    if (sectionId === this._sectionId()) return;

    this.loadSub?.unsubscribe();
    this._sectionId.set(sectionId);
    this._bookmarks.set([]);
    this._loadError.set(false);
    this._loading.set(false);

    if (sectionId !== null) this.fetch(sectionId);
  }

  public reload(): void {
    const id = this._sectionId();
    if (id !== null) this.fetch(id);
  }

  /** Always emits one outcome and completes; it never errors. */
  public add(positionSeconds: number, note: string | null = null): Observable<AddBookmarkOutcome> {
    const sectionId = this._sectionId();
    if (sectionId === null) return of<AddBookmarkOutcome>({ kind: 'error' });
    if (this._bookmarks().some((b) => b.positionSeconds === positionSeconds)) {
      return of<AddBookmarkOutcome>({ kind: 'duplicate' });
    }
    if (this.isFull()) return of<AddBookmarkOutcome>({ kind: 'full' });

    return this.api.createBookmark(sectionId, { positionSeconds, note }).pipe(
      map((created): AddBookmarkOutcome => {
        if (this._sectionId() === sectionId) {
          this._bookmarks.update((list) => insertSorted(list, created));
          this.flash(created.id);
        }
        return { kind: 'added', bookmark: created };
      }),
      catchError((err: HttpErrorResponse) => of(toOutcome(err))),
    );
  }

  /** Emits true on success, false on failure. */
  public updateNote(id: string, note: string | null): Observable<boolean> {
    return this.api.updateBookmarkNote(id, { note }).pipe(
      map((updated) => {
        this._bookmarks.update((list) => list.map((b) => (b.id === updated.id ? updated : b)));
        return true;
      }),
      catchError(() => of(false)),
    );
  }

  /** Optimistic: the row goes immediately and comes back if the call fails. */
  public remove(bookmark: Bookmark): Observable<boolean> {
    return defer(() => {
      const sectionId = this._sectionId();
      this._bookmarks.update((list) => list.filter((b) => b.id !== bookmark.id));

      return this.api.deleteBookmark(bookmark.id).pipe(
        map(() => true),
        catchError((err: HttpErrorResponse) => {
          if (err.status === 404) return of(true); // already gone
          if (this._sectionId() === sectionId) {
            this._bookmarks.update((list) => insertSorted(list, bookmark));
          }
          return of(false);
        }),
      );
    });
  }

  private fetch(sectionId: number): void {
    this.loadSub?.unsubscribe();
    this._loading.set(true);
    this._loadError.set(false);

    this.loadSub = this.api.getSectionBookmarks(sectionId).subscribe({
      next: (list) => {
        this._bookmarks.set(list);
        this._loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load bookmarks', err);
        this._loadError.set(true);
        this._loading.set(false);
      },
    });
  }

  private flash(id: string): void {
    this._lastAddedId.set(id);
    clearTimeout(this.flashTimer);
    this.flashTimer = setTimeout(() => this._lastAddedId.set(null), 1600);
  }
}