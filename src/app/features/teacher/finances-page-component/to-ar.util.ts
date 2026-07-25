const AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/**
 * Converts Western (Hindi) digits in a string/number to Arabic-Indic numerals.
 * e.g. toAr(1250) -> '١٢٥٠'
 *
 * If this helper already exists elsewhere in the project (per established
 * convention), delete this file and update the import paths below to point
 * to the existing one instead.
 */
export function toAr(value: string | number): string {
  return String(value).replace(/\d/g, (digit) => AR_DIGITS[+digit]);
}
