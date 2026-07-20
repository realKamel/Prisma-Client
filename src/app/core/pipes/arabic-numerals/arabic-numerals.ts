const AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/** Converts any number/numeric string to Eastern Arabic numerals for display */
export function toArabicNumerals(value: number | string): string {
  return String(value).replace(/\d/g, (d) => AR_DIGITS[+d]);
}

/** Two-letter avatar initials from a full Arabic name */
export function studentInitials(name: string): string {
  return name.trim().split(' ').slice(0, 2).map((w) => w[0]).join('');
}