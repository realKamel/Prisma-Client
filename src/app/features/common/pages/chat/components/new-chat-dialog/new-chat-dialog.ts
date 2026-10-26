import { CdkTrapFocus } from '@angular/cdk/a11y';
import { Component, inject, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { bootstrapSearch, bootstrapX } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMessageSquarePlus, lucideUsers } from '@ng-icons/lucide';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, finalize, Subject, switchMap, tap } from 'rxjs';
import { ChatContact } from '../../../../../../core/models/chat/chat.models';
import { ChatDirectoryService } from '../../../../../../core/services/chat/chat-directory.service';
import { ChatAvatarComponent } from '../chat-avatar/chat-avatar';

@Component({
  selector: 'app-new-chat-dialog',
  imports: [CdkTrapFocus, ChatAvatarComponent, NgIcon, TranslatePipe],
  templateUrl: './new-chat-dialog.html',
  styleUrl: './new-chat-dialog.css',
  viewProviders: [
    provideIcons({ bootstrapSearch, bootstrapX, lucideMessageSquarePlus, lucideUsers }),
  ],
})
export class NewChatDialogComponent {
  private readonly directory = inject(ChatDirectoryService);
  private readonly translate = inject(TranslateService);

  public readonly dismiss = output<void>();
  public readonly contactSelected = output<string>();

  protected readonly isSearching = signal(false);
  protected readonly query = signal('');

  private readonly searchTerms = new Subject<string>();

  protected readonly results = toSignal(
    this.searchTerms.pipe(
      debounceTime(220),
      distinctUntilChanged(),
      tap(() => this.isSearching.set(true)),
      switchMap((term) =>
        this.directory.search(term).pipe(finalize(() => this.isSearching.set(false))),
      ),
    ),
    { initialValue: [] as ChatContact[] },
  );

  constructor() {
    void this.directory.ensureLoaded();
    this.searchTerms.next('');
  }

  protected onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
    this.searchTerms.next(value);
  }

  protected clearSearch(event: Event): void {
    event.stopPropagation();
    this.query.set('');
    this.searchTerms.next('');
  }

  protected select(contact: ChatContact): void {
    this.contactSelected.emit(contact.userId);
  }

  protected roleLabel(role: string | null): string {
    if (!role) return '';

    return this.translate.instant(`CHAT.ROLES.${role.toUpperCase()}`);
  }
}
