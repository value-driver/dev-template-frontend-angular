import { inject, Injectable } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';

import { ConfirmOptions, DialogOptions } from '@core/feedback/feedback.models';

@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly modal = inject(NzModalService);

  confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      this.modal.confirm({
        nzTitle: options.title,
        nzContent: options.content,
        nzOkText: options.okText ?? 'Confirm',
        nzCancelText: options.cancelText ?? 'Cancel',
        nzOkType: options.okType ?? (options.okDanger ? 'primary' : 'primary'),
        nzOkDanger: options.okDanger ?? false,
        nzWidth: options.width ?? 480,
        nzCentered: options.centered ?? true,
        nzMaskClosable: options.maskClosable ?? false,
        nzOnOk: () => resolve(true),
        nzOnCancel: () => resolve(false),
      });
    });
  }

  deleteConfirm(itemName: string, message?: string): Promise<boolean> {
    return this.confirm({
      title: `Delete ${itemName}?`,
      content:
        message ??
        `Are you sure you want to permanently delete "${itemName}"? This action cannot be undone.`,
      okText: 'Delete',
      cancelText: 'Cancel',
      okDanger: true,
      centered: true,
    });
  }

  info(options: DialogOptions): Promise<void> {
    return new Promise((resolve) => {
      this.modal.info({
        nzTitle: options.title,
        nzContent: options.content,
        nzOkText: options.okText ?? 'OK',
        nzWidth: options.width ?? 480,
        nzCentered: options.centered ?? true,
        nzOnOk: () => resolve(),
      });
    });
  }

  success(options: DialogOptions): Promise<void> {
    return new Promise((resolve) => {
      this.modal.success({
        nzTitle: options.title,
        nzContent: options.content,
        nzOkText: options.okText ?? 'OK',
        nzWidth: options.width ?? 480,
        nzCentered: options.centered ?? true,
        nzOnOk: () => resolve(),
      });
    });
  }

  error(options: DialogOptions): Promise<void> {
    return new Promise((resolve) => {
      this.modal.error({
        nzTitle: options.title,
        nzContent: options.content,
        nzOkText: options.okText ?? 'OK',
        nzWidth: options.width ?? 480,
        nzCentered: options.centered ?? true,
        nzOnOk: () => resolve(),
      });
    });
  }

  warning(options: DialogOptions): Promise<void> {
    return new Promise((resolve) => {
      this.modal.warning({
        nzTitle: options.title,
        nzContent: options.content,
        nzOkText: options.okText ?? 'OK',
        nzWidth: options.width ?? 480,
        nzCentered: options.centered ?? true,
        nzOnOk: () => resolve(),
      });
    });
  }
}
