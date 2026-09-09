import { Routes } from '@angular/router';

import { SettingsPageComponent } from '@features/settings/pages/settings-page/settings-page.component';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    component: SettingsPageComponent,
  },
];
