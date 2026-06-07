import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PlatformConfig } from '../Models/platform-config';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private http = inject(HttpClient);

  config = toSignal(
    this.http.get<PlatformConfig>('/assets/config/platform.config.json'),
    { initialValue: null }
  );
}
