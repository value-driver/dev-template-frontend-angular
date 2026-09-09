import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';

import { ToastService } from '@core/feedback/toast.service';
import { DialogService } from '@core/feedback/dialog.service';

describe('Feedback Services (ToastService & DialogService)', () => {
  let toastService: ToastService;
  let dialogService: DialogService;

  const mockMessageService = {
    success: (_content: string) => ({ messageId: 'msg-1' }),
    error: (_content: string) => ({ messageId: 'msg-2' }),
    info: (_content: string) => ({ messageId: 'msg-3' }),
    warning: (_content: string) => ({ messageId: 'msg-4' }),
    loading: (_content: string) => ({ messageId: 'msg-5' }),
    remove: () => {},
  };

  const mockNotificationService = {
    success: () => {},
    error: () => {},
    info: () => {},
    warning: () => {},
  };

  const mockModalService = {
    confirm: (config: { nzOnOk?: () => void }) => {
      config.nzOnOk?.();
      return {} as ReturnType<NzModalService['confirm']>;
    },
    info: (config: { nzOnOk?: () => void }) => {
      config.nzOnOk?.();
      return {} as ReturnType<NzModalService['info']>;
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ToastService,
        DialogService,
        { provide: NzMessageService, useValue: mockMessageService },
        { provide: NzNotificationService, useValue: mockNotificationService },
        { provide: NzModalService, useValue: mockModalService },
      ],
    });
    toastService = TestBed.inject(ToastService);
    dialogService = TestBed.inject(DialogService);
  });

  it('should emit success toast with returned message id', () => {
    const id = toastService.success('Record created');
    expect(id).toBe('msg-1');
  });

  it('should resolve confirmation dialog to true on confirmation', async () => {
    const result = await dialogService.confirm({
      title: 'Confirm Action',
      content: 'Are you sure?',
    });
    expect(result).toBe(true);
  });
});
