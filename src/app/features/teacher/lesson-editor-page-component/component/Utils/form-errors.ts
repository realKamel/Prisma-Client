import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

type ErrorMessage = string | ((error: any) => string);

/**
 * Messages per field key, per error code.
 * The key is NOT always the control name: items inside arrays use their own keys
 * (`chapterName`, `outcomeItem`) so the same message works for every row.
 */
const ERROR_MESSAGES: Record<string, Record<string, ErrorMessage>> = {
  title: {
    required: 'عنوان الدرس مطلوب',
    minlength: (e) => `يجب ألا يقل العنوان عن ${e.requiredLength} أحرف`,
  },
  price: {
    required: 'السعر مطلوب',
    min: (e) => `يجب ألا يقل السعر عن ${e.min}`,
  },
  chapters: { required: 'أضف فصلًا واحدًا على الأقل' },
  chapterName: { required: 'عنوان الفصل مطلوب' },
  outcomes: { required: 'أضف نتيجة تعلّم واحدة على الأقل' },
  outcomeItem: { required: 'اكتب نتيجة التعلّم أو احذف الخانة' },
  academicYearIds: { required: 'اختر سنة دراسية واحدة على الأقل' },
  assignmentDueDate: { required: 'حدد آخر موعد لتسليم الواجب' },
  assignmentFile: { required: 'ارفع ملف الواجب' },
};

/** Returns the message for the control's first error, once it is touched or dirty. */
export function errorMessage(control: AbstractControl | null, key: string): string | null {
  if (!control?.errors || !(control.touched || control.dirty)) return null;

  const code = Object.keys(control.errors)[0];
  const message = ERROR_MESSAGES[key]?.[code];

  if (!message) return 'قيمة غير صالحة';
  return typeof message === 'function' ? message(control.errors[code]) : message;
}

/**
 * Like Validators.required, but whitespace-only text also counts as empty.
 * Returns the `required` code so the messages above work unchanged.
 */
export const requiredText: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  String(control.value ?? '').trim().length > 0 ? null : { required: true };