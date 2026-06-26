const ARABIC_INDIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/**
 * Converts any number (or numeric string) to Arabic-indic numerals.
 * Mirrors the existing `toAr()` helper used elsewhere on the platform.
 */
export function toAr(value: number | string): string {
  return String(value).replace(/\d/g, (digit) => ARABIC_INDIC_DIGITS[Number(digit)]);
}
