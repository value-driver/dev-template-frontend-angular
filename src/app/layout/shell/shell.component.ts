import { Component } from '@angular/core';
import { AuthenticatedLayoutComponent } from '@layout/authenticated-layout/authenticated-layout.component';

@Component({
  selector: 'app-shell',
  imports: [AuthenticatedLayoutComponent],
  template: `<app-authenticated-layout />`,
})
export class ShellComponent {}
