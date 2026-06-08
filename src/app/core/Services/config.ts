import { inject, Injectable, signal } from '@angular/core';
import { PlatformConfig } from '../Models/platform-config';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private http = inject(HttpClient);

  config = signal<PlatformConfig | null>(null);

  load() {
    return this.http
      .get<PlatformConfig>('assets/config/platform.config.json')
      .pipe(tap((data) => this.config.set(data)));
  }
}
