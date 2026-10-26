import { Service, signal } from '@angular/core';

@Service()
export class ToastService {
  private readonly messageSignal = signal<string | null>(null);
  private timer: ReturnType<typeof setTimeout> | undefined;

  public readonly message = this.messageSignal.asReadonly();

  public show(message: string, duration = 3200): void {
    this.messageSignal.set(message);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.messageSignal.set(null), duration);
  }
}
