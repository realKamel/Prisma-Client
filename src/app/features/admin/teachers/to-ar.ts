const ARABIC_INDIC = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export function toAr(value: number | string): string {
  return String(value).replace(/\d/g, (d) => ARABIC_INDIC[Number(d)]);
}
