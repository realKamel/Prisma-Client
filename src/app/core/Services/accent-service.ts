import { DOCUMENT, effect, inject, Injectable, Service, signal } from '@angular/core';
import { AccentColor } from '../Models/Accent-color-model';
import { AccentApiService } from './accent-api-service';
import { catchError, finalize, map, Observable, of, tap } from 'rxjs';

const ACCENT_ATTR_MAP: Record<AccentColor, string | null> = {
  Purple: null, // default — no attribute
  Teal: 'teal',
  Blue: 'blue',
};

@Service()
export class AccentService {
  private readonly document = inject(DOCUMENT);
  private readonly svc = inject(AccentApiService);

  readonly accent = signal<AccentColor>('Purple');
  readonly saving = signal(false);
  // loaded = signal(false);

  constructor() {
    // بيطبق live preview أول ما الـ signal يتغير — نفس فكرة ThemeService
    effect(() => {
      const attr = ACCENT_ATTR_MAP[this.accent()];
      if (attr) {
        this.document.documentElement.setAttribute('data-accent', attr);
      } else {
        this.document.documentElement.removeAttribute('data-accent');
      }
    });
  }

  /** بتتنادى وقت الـ app init — تجيب القيمة المحفوظة من الـ Backend */
  loadFromServer(): Observable<void> {
    return this.svc.getAccentColor().pipe(
      tap((res) => {
        if (res.succeeded && res.data) {
          this.accent.set(res.data.accentColor);
        }
      }),
      map(() => void 0),
      catchError(() => {
        return of(void 0);
      }),
    );
  }

  /** live preview فوري — بتتنادى وقت select() في الـ component، من غير ما تستنى الحفظ */
  preview(accentColor: AccentColor): void {
    this.accent.set(accentColor);
  }

  /** حفظ فعلي على السيرفر */
  save(accentColor: AccentColor): Observable<boolean> {
    this.saving.set(true);
    return this.svc.updateAccentColor(accentColor).pipe(
      tap((res) => {
        if (res.succeeded) this.accent.set(accentColor);
      }),
      map((res) => res.succeeded),
      catchError(() => of(false)),
      finalize(() => this.saving.set(false)),
    );
  }
}
