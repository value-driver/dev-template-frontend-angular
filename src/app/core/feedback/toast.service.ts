import { inject, Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';

import { ToastOptions, ToastType } from '@core/feedback/feedback.models';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly nzMessage = inject(NzMessageService);
  private readonly nzNotification = inject(NzNotificationService);

  success(content: string, options?: ToastOptions): string {
    return this.nzMessage.success(content, {
      nzDuration: options?.duration ?? 3000,
      nzPauseOnHover: options?.pauseOnHover ?? true,
    }).messageId;
  }

  error(content: string, options?: ToastOptions): string {
    return this.nzMessage.error(content, {
      nzDuration: options?.duration ?? 4500,
      nzPauseOnHover: options?.pauseOnHover ?? true,
    }).messageId;
  }

  info(content: string, options?: ToastOptions): string {
    return this.nzMessage.info(content, {
      nzDuration: options?.duration ?? 3000,
      nzPauseOnHover: options?.pauseOnHover ?? true,
    }).messageId;
  }

  warning(content: string, options?: ToastOptions): string {
    return this.nzMessage.warning(content, {
      nzDuration: options?.duration ?? 4000,
      nzPauseOnHover: options?.pauseOnHover ?? true,
    }).messageId;
  }

  loading(content: string, options?: ToastOptions): string {
    return this.nzMessage.loading(content, {
      nzDuration: options?.duration ?? 0,
      nzPauseOnHover: options?.pauseOnHover ?? true,
    }).messageId;
  }

  remove(messageId?: string): void {
    this.nzMessage.remove(messageId);
  }

  notify(type: ToastType, title: string, content: string, options?: ToastOptions): void {
    const duration = options?.duration ?? 4500;
    switch (type) {
      case 'success':
        this.nzNotification.success(title, content, { nzDuration: duration });
        break;
      case 'error':
        this.nzNotification.error(title, content, { nzDuration: duration });
        break;
      case 'warning':
        this.nzNotification.warning(title, content, { nzDuration: duration });
        break;
      case 'loading':
      case 'info':
      default:
        this.nzNotification.info(title, content, { nzDuration: duration });
        break;
    }
  }
}
