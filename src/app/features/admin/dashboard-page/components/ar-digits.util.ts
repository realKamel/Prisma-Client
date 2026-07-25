const ARABIC_INDIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/** Converts Western digits (and a decimal point) to Arabic-Indic form. */
export function toAr(value: number | string): string {
  return String(value)
    .replace(/\d/g, (digit) => ARABIC_INDIC_DIGITS[Number(digit)])
    .replace(/\./g, '٫');
}
