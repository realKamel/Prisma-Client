import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Bookmark,
  CreateBookmarkRequest,
  UpdateBookmarkNoteRequest,
} from '../models/bookmark.model';

@Service()
export class BookmarkService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = `${environment.apiUrl}/bookmarks`;

  /** Bookmarks of the current student for one section, ordered by position. */
  public getSectionBookmarks(sectionId: number): Observable<Bookmark[]> {
    return this.http.get<Bookmark[]>(`${this.baseUrl}/sections/${sectionId}`);
  }

  public createBookmark(sectionId: number, request: CreateBookmarkRequest): Observable<Bookmark> {
    return this.http.post<Bookmark>(`${this.baseUrl}/sections/${sectionId}`, request);
  }

  public updateBookmarkNote(
    bookmarkId: string,
    request: UpdateBookmarkNoteRequest,
  ): Observable<Bookmark> {
    return this.http.put<Bookmark>(`${this.baseUrl}/${bookmarkId}`, request);
  }

  public deleteBookmark(bookmarkId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${bookmarkId}`);
  }
}