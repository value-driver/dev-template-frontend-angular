import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';

import { DialogService } from '@core/feedback/dialog.service';

export interface UnsavedChangesPage {
  hasUnsavedChanges(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<UnsavedChangesPage> = (component) => {
  if (!component.hasUnsavedChanges()) return true;

  return inject(DialogService).confirm({
    title: 'Discard changes?',
    content: 'Your unsaved changes will be lost.',
    okText: 'Discard',
    cancelText: 'Keep editing',
    okDanger: true,
  });
};
