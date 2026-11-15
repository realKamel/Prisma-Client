import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

/**
 * Asks before leaving a route whose component reports unsaved changes.
 * `confirm()` is the quick version; swap it for your modal service when you want a styled dialog
 * (the guard may return an Observable<boolean> or Promise<boolean> too).
 */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (!component.hasUnsavedChanges()) return true;
  return confirm(inject(TranslateService).instant('COMMON.UNSAVED.MESSAGE'));
};