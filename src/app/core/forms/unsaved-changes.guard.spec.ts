import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { DialogService } from '@core/feedback/dialog.service';
import { unsavedChangesGuard } from '@core/forms/unsaved-changes.guard';

describe('unsavedChangesGuard', () => {
  it('allows navigation when the page is clean', () => {
    TestBed.configureTestingModule({ providers: [{ provide: DialogService, useValue: {} }] });

    const result = TestBed.runInInjectionContext(() =>
      unsavedChangesGuard(
        { hasUnsavedChanges: () => false },
        {} as never,
        {} as never,
        {} as never,
      ),
    );

    expect(result).toBe(true);
  });

  it('asks before leaving a page with edits', async () => {
    const confirm = vi.fn().mockResolvedValue(true);
    TestBed.configureTestingModule({
      providers: [{ provide: DialogService, useValue: { confirm } }],
    });

    const result = TestBed.runInInjectionContext(() =>
      unsavedChangesGuard({ hasUnsavedChanges: () => true }, {} as never, {} as never, {} as never),
    );

    await expect(result).resolves.toBe(true);
    expect(confirm).toHaveBeenCalledOnce();
  });
});
