import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { firstValueFrom, map, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ChatContact } from '../../Models/Chat/chat.models';
import { AuthStoreService } from '../auth-store.service';
import { TeacherCatalogService } from '../teacher-catalog.service';
import { filterContactable, normalizeForSearch } from './chat-policy';

/** `StudentListItemDto` from `/teacherstudents` (only the fields the directory needs). */
interface StudentDirectoryEntry {
  id: string;
  name: string;
  email: string;
  grade: string;
}

/** `AssistantInfo` from `/assistants`. */
interface AssistantDirectoryEntry {
  id: string | null;
  email: string | null;
  firstName: string | null;
  secondName: string | null;
}

/** `UserListItemDto` from `/users` (admin directory). */
interface UserDirectoryEntry {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

/**
 * Address book for the chat feature.
 *
 * The chat DTOs only carry user ids, so names/avatars have to be resolved from
 * the directories the current role is already allowed to read:
 *   student          → teacher catalog (searchable server-side)
 *   teacher/assistant→ own students (+ assistants for a teacher)
 *   admin            → every user
 * Unknown teacher ids are resolved through the public teacher profile endpoint.
 */
@Service()
export class ChatDirectoryService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthStoreService);
  private readonly teacherCatalog = inject(TeacherCatalogService);

  private readonly contactsSignal = signal<ReadonlyMap<string, ChatContact>>(new Map());
  public readonly contacts = this.contactsSignal.asReadonly();
  public readonly isLoading = signal(false);

  private loadedForRole: string | null = null;
  private loadPromise: Promise<void> | null = null;
  private readonly resolving = new Set<string>();

  /** The role's address book, already filtered by the contactability policy. */
  public allContacts(): ChatContact[] {
    return filterContactable([...this.contactsSignal().values()], this.auth.role());
  }

  public find(userId: string): ChatContact | undefined {
    return this.contactsSignal().get(userId);
  }

  /** Loads the role directory once per session (and again after switching accounts). */
  public ensureLoaded(): Promise<void> {
    const role = (this.auth.role() ?? '').toLowerCase();

    if (!role) return Promise.resolve();
    if (this.loadedForRole === role && !this.isLoading()) return Promise.resolve();
    if (this.loadPromise) return this.loadPromise;

    this.isLoading.set(true);

    this.loadPromise = this.fetchDirectory(role)
      .then((contacts) => {
        this.merge(contacts);
        this.loadedForRole = role;
      })
      .catch(() => {
        // A failed directory only costs display names; the chat itself keeps working.
      })
      .finally(() => {
        this.isLoading.set(false);
        this.loadPromise = null;
      });

    return this.loadPromise;
  }

  /**
   * Resolves ids that are still unknown after the directory load — used for
   * conversation members that fall outside the paged contact list.
   */
  public async resolve(ids: readonly string[]): Promise<void> {
    const pending = new Set(ids.filter((id) => !!id && !this.contactsSignal().has(id)));
    let rounds = 0;

    // Teacher profiles are fetched in small parallel batches to stay gentle on the API.
    while (pending.size > 0 && rounds < 5) {
      const batch = [...pending]
        .filter((id) => !this.resolving.has(id))
        .slice(0, 6);

      if (batch.length === 0) return;

      batch.forEach((id) => {
        this.resolving.add(id);
        pending.delete(id);
      });

      const resolved = await Promise.all(batch.map((id) => this.fetchTeacherProfile(id)));
      this.merge(resolved.filter((contact): contact is ChatContact => !!contact));
      batch.forEach((id) => this.resolving.delete(id));
      rounds += 1;
    }
  }

  /**
   * Contact picker search. Students query the teacher catalog server-side
   * (it is paged); staff filter the fully loaded directory locally.
   */
  public search(term: string): Observable<ChatContact[]> {
    const role = (this.auth.role() ?? '').toLowerCase();
    const query = term.trim();

    if (role === 'student') {
      return this.teacherCatalog.getTeachers(1, 50, query).pipe(
        map((page) =>
          filterContactable(
            page.items.map((teacher) => this.toTeacherContact(teacher)),
            role,
          ),
        ),
        catchError(() => of([])),
      );
    }

    const normalized = normalizeForSearch(query);
    const contacts = this.allContacts();

    if (!normalized) return of(contacts.slice(0, 50));

    return of(
      contacts
        .filter((contact) => normalizeForSearch(contact.name).includes(normalized))
        .slice(0, 50),
    );
  }

  private fetchDirectory(role: string): Promise<ChatContact[]> {
    switch (role) {
      case 'student':
        return firstValueFrom(this.teacherCatalog.getTeachers(1, 50)).then((page) =>
          page.items.map((teacher) => this.toTeacherContact(teacher)),
        );

      case 'teacher':
        return Promise.all([this.fetchStudents(), this.fetchAssistants()]).then(
          ([students, assistants]) => [...students, ...assistants],
        );

      case 'assistant':
        return this.fetchStudents();

      case 'admin':
        return this.fetchUsers();

      default:
        return Promise.resolve([]);
    }
  }

  private fetchStudents(): Promise<ChatContact[]> {
    return firstValueFrom(
      this.http
        .get<StudentDirectoryEntry[]>(`${environment.apiUrl}/teacherstudents`)
        .pipe(catchError(() => of([]))),
    ).then((students) =>
      (students ?? []).map((student) => ({
        userId: student.id,
        name: student.name,
        role: 'student',
        subtitle: student.grade,
        avatarUrl: null,
      })),
    );
  }

  private fetchAssistants(): Promise<ChatContact[]> {
    return firstValueFrom(
      this.http
        .get<AssistantDirectoryEntry[]>(`${environment.apiUrl}/assistants`)
        .pipe(catchError(() => of([]))),
    ).then((assistants) =>
      (assistants ?? [])
        .filter((assistant) => !!assistant.id)
        .map((assistant) => ({
          userId: assistant.id as string,
          name: [assistant.firstName, assistant.secondName].filter(Boolean).join(' ').trim(),
          role: 'assistant',
          subtitle: assistant.email,
          avatarUrl: null,
        })),
    );
  }

  private fetchUsers(): Promise<ChatContact[]> {
    return firstValueFrom(
      this.http
        .get<UserDirectoryEntry[]>(`${environment.apiUrl}/users`)
        .pipe(catchError(() => of([]))),
    ).then((users) =>
      (users ?? [])
        .filter((user) => user.active)
        .map((user) => ({
          userId: user.id,
          name: user.name,
          role: user.role?.toLowerCase() ?? null,
          subtitle: user.email,
          avatarUrl: null,
        })),
    );
  }

  private fetchTeacherProfile(userId: string): Promise<ChatContact | null> {
    return firstValueFrom(
      this.teacherCatalog.getTeacherProfile(userId).pipe(catchError(() => of(null))),
    )
      .then((profile) =>
        profile
          ? {
              userId: profile.id,
              name: [profile.firstName, profile.secondName].filter(Boolean).join(' ').trim(),
              role: 'teacher',
              subtitle: profile.subject,
              avatarUrl: profile.imageUrl ?? null,
            }
          : null,
      )
      .catch(() => null);
  }

  private toTeacherContact(teacher: {
    id: string;
    firstName: string;
    secondName: string;
    subject: string;
    imageUrl?: string | null;
  }): ChatContact {
    return {
      userId: teacher.id,
      name: [teacher.firstName, teacher.secondName].filter(Boolean).join(' ').trim(),
      role: 'teacher',
      subtitle: teacher.subject,
      avatarUrl: teacher.imageUrl ?? null,
    };
  }

  private merge(contacts: ChatContact[]): void {
    if (contacts.length === 0) return;

    this.contactsSignal.update((current) => {
      const next = new Map(current);
      contacts.forEach((contact) => next.set(contact.userId, contact));
      return next;
    });
  }
}
