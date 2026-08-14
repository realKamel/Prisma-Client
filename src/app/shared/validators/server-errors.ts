import { AbstractControl, FormGroup } from '@angular/forms';
import { IProblemDetails } from '../../core/Models/problemDetails';

/**
 * Maps ASP.NET ProblemDetails field validation errors (the `errors` dictionary,
 * keyed by property name — e.g. `{ FirstName: ["Name must contain only letters."] }`)
 * onto the matching FormControls of a reactive form.
 *
 * - Keys are matched case-insensitively, so `FirstName` maps to control `firstName`.
 * - The matched control gets `{ server: message }` set as its error and is marked
 *   touched + dirty, so existing `(touched || submitted)` error styling renders it.
 * - Keys with no matching control are returned so the caller can surface them as a
 *   general/toast fallback.
 *
 * The `server` error is automatically cleared as soon as the user edits the field,
 * because Angular re-runs the control's validators on every value change.
 *
 * @returns the field keys that could NOT be mapped to any control.
 */
export function applyServerErrors(
  form: FormGroup,
  problem: IProblemDetails | null | undefined,
): string[] {
  const errors = problem?.errors;
  if (!errors) return [];

  const controlsByName = new Map(
    Object.keys(form.controls).map((name) => [name.toLowerCase(), form.controls[name]]),
  );

  const unmapped: string[] = [];
  for (const [key, messages] of Object.entries(errors)) {
    const control = controlsByName.get(key.toLowerCase());
    if (!control) {
      unmapped.push(key);
      continue;
    }
    control.setErrors({ server: messages.join(' ') });
    control.markAsTouched();
    control.markAsDirty();
  }
  return unmapped;
}

/**
 * Reads the server validation message currently set on a control, if any.
 * Use this in templates to render the API message inline under a field:
 *
 * ```html
 * @if (serverErrorOf(f['firstName'])) {
 *   <div class="field-error">{{ serverErrorOf(f['firstName']) }}</div>
 * }
 * ```
 */
export function serverErrorOf(control: AbstractControl | null | undefined): string | null {
  return (control?.errors?.['server'] as string | undefined) ?? null;
}
