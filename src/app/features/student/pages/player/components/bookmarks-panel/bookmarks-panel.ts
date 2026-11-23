import {
  afterNextRender,
  Component,
  effect,
  inject,
  Injector,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import {
  bootstrapBookmarkFill,
  bootstrapCheckLg,
  bootstrapPencil,
  bootstrapPlayFill,
  bootstrapTrash3,
  bootstrapXLg,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { toast } from 'ngx-sonner';
import {
  Bookmark,
  formatBookmarkTime,
  MAX_BOOKMARK_NOTE_LENGTH,
} from '../../../../models/bookmark.model';
import { BookmarksState } from '../../bookmarks.state';

@Component({
  selector: 'app-bookmarks-panel',
  imports: [NgIcon, TranslatePipe],
  templateUrl: './bookmarks-panel.html',
  styleUrl: './bookmarks-panel.css',
  viewProviders: [
    provideIcons({
      bootstrapBookmarkFill,
      bootstrapCheckLg,
      bootstrapPencil,
      bootstrapPlayFill,
      bootstrapTrash3,
      bootstrapXLg,
    }),
  ],
})
export class BookmarksPanelComponent {
  protected readonly state = inject(BookmarksState);
  private readonly translate = inject(TranslateService);
  private readonly injector = inject(Injector);

  public readonly sectionTitle = input<string>('');
  public readonly seek = output<number>();

  protected readonly maxNoteLength = MAX_BOOKMARK_NOTE_LENGTH;
  protected readonly format = formatBookmarkTime;

  protected readonly editingId = signal<string | null>(null);
  protected readonly editDraft = signal('');
  protected readonly savingId = signal<string | null>(null);

  constructor() {
    // A different lecture means a different list, so drop any half-finished edit.
    effect(() => {
      void this.state.sectionId();
      untracked(() => this.editingId.set(null));
    });
  }

  protected startEdit(bookmark: Bookmark): void {
    this.editingId.set(bookmark.id);
    this.editDraft.set(bookmark.note ?? '');
    afterNextRender(
      () => {
        const el = document.getElementById(`bookmark-edit-${bookmark.id}`);
        if (el instanceof HTMLTextAreaElement) {
          this.autosize(el);
          el.focus();
          el.setSelectionRange(el.value.length, el.value.length);
        }
      },
      { injector: this.injector },
    );
  }

  protected onEditInput(event: Event): void {
    const el = event.target as HTMLTextAreaElement;
    // A note is one line of text, so pasted line breaks become spaces.
    const clean = el.value.replace(/\s*[\r\n]+\s*/g, ' ');
    if (clean !== el.value) el.value = clean;
    this.editDraft.set(clean);
    this.autosize(el);
  }

  private autosize(el: HTMLTextAreaElement): void {
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
  }

  protected saveEdit(bookmark: Bookmark): void {
    if (this.savingId() !== null) return;

    const trimmed = this.editDraft().trim();
    const note = trimmed.length > 0 ? trimmed : null;
    if (note === bookmark.note) {
      this.cancelEdit();
      return;
    }

    this.savingId.set(bookmark.id);
    this.state.updateNote(bookmark.id, note).subscribe((ok) => {
      this.savingId.set(null);
      if (ok) this.editingId.set(null);
      else toast.error(this.translate.instant('BOOKMARKS.ERRORS.GENERIC'));
    });
  }

  protected remove(bookmark: Bookmark): void {
    if (this.editingId() === bookmark.id) this.editingId.set(null);
    this.state.remove(bookmark).subscribe((ok) => {
      if (!ok) toast.error(this.translate.instant('BOOKMARKS.ERRORS.GENERIC'));
    });
  }

  // The player listens for k, m, f, c, j, l, digits and arrows on the document,
  // so keys typed into the field must not bubble up there.
  protected onEditKeydown(event: KeyboardEvent, bookmark: Bookmark): void {
    event.stopPropagation();
    if (event.key === 'Enter') {
      event.preventDefault();
      this.saveEdit(bookmark);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelEdit();
    }
  }
}