/**
 * Day grouping for the message thread. Formatting itself is left to `DatePipe`
 * and the `CHAT.TODAY` / `CHAT.YESTERDAY` i18n keys, so nothing here duplicates
 * a pipe — these helpers only decide which messages share a day divider.
 */

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Stable key used to group messages per calendar day. */
export function dayKey(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : String(startOfDay(date));
}

export function isToday(value: string, now = new Date()): boolean {
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && startOfDay(date) === startOfDay(now);
}

export function isYesterday(value: string, now = new Date()): boolean {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  return startOfDay(date) === startOfDay(yesterday);
}
