import { ChatContact } from '../../models/chat/chat.models';

/** Roles allowed to open a conversation with anybody. */
const UNRESTRICTED_ROLES = new Set(['teacher', 'assistant', 'admin']);

/** Roles a student is allowed to reach. */
const STUDENT_CONTACTABLE_ROLES = new Set(['teacher', 'assistant', 'admin']);

/**
 * Who may start a conversation with whom.
 *
 * The backend rule is still pending, so the client mirrors the agreed policy:
 * teachers, assistants and admins can reach anyone, while students are limited
 * to the teaching staff. Keeping it in one place makes it trivial to swap for a
 * server-provided matrix later.
 */
export function canStartConversationWith(
  viewerRole: string | null | undefined,
  targetRole: string | null | undefined,
): boolean {
  const viewer = viewerRole?.toLowerCase();

  if (!viewer) return false;
  if (UNRESTRICTED_ROLES.has(viewer)) return true;

  const target = targetRole?.toLowerCase();
  return !!target && STUDENT_CONTACTABLE_ROLES.has(target);
}

/** Filters a directory down to the contacts the viewer is allowed to message. */
export function filterContactable(
  contacts: readonly ChatContact[],
  viewerRole: string | null | undefined,
): ChatContact[] {
  return contacts.filter((contact) => canStartConversationWith(viewerRole, contact.role));
}

/** Normalises Arabic/Latin names so search ignores hamza, tashkeel and case. */
export function normalizeForSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f\u064B-\u0652\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
