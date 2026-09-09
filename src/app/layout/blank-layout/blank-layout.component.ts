import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-blank-layout',
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-white text-[#101828] transition-colors">
      <main class="w-full">
        <router-outlet />
      </main>
    </div>
  `,
})
export class BlankLayoutComponent {}
