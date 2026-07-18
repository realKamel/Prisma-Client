import { Service, signal } from '@angular/core';

export type ToastType = 'success' | 'error';

export interface Toast {
  message: string;
  type: ToastType;
}
@Service()
export class ToastService {
  toast = signal<Toast | null>(null);

  private timer: ReturnType<typeof setTimeout> | null = null;

  show(message: string, type: ToastType = 'success', duration = 3000): void {
    if (this.timer) clearTimeout(this.timer);
    this.toast.set({ message, type });
    this.timer = setTimeout(() => this.toast.set(null), duration);
  }

  success(message: string): void {
    this.show(message, 'success');
  }
  error(message: string): void {
    this.show(message, 'error');
  }
}
