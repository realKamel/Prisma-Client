import { BreakpointObserver } from '@angular/cdk/layout';
import { inject, Service } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Service()
export class DeviceScreenDetectorService {
  private readonly breakpointObserver = inject(BreakpointObserver);

  /**
   * Signal emitting true when the screen matches mobile breakpoints.
   * Access in components/templates using `deviceService.isMobile()`
   */
  public readonly isMobile = toSignal(
    this.breakpointObserver.observe('(max-width: 767.99px)').pipe(map((result) => result.matches)),
    { initialValue: false },
  );
}
