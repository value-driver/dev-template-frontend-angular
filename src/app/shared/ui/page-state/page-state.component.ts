import { Component, input, output } from '@angular/core';
import { LucideCircleAlert, LucideInbox, LucideLoaderCircle } from '@lucide/angular';

export type PageState = 'empty' | 'error' | 'loading';

@Component({
  selector: 'app-page-state',
  imports: [LucideCircleAlert, LucideInbox, LucideLoaderCircle],
  template: `
    <section
      class="rounded-xl border border-[#D2D2D2] bg-white px-5 py-10 text-center"
      [attr.aria-busy]="state() === 'loading'"
    >
      @if (state() === 'loading') {
        <svg
          lucideLoaderCircle
          class="mx-auto h-5 w-5 animate-spin text-[#1350DF]"
          aria-hidden="true"
        ></svg>
      } @else if (state() === 'error') {
        <svg lucideCircleAlert class="mx-auto h-5 w-5 text-[#F24150]" aria-hidden="true"></svg>
      } @else {
        <svg lucideInbox class="mx-auto h-5 w-5 text-[#787676]" aria-hidden="true"></svg>
      }
      <p class="mt-3 text-sm font-semibold text-[#101828]">{{ title() }}</p>
      @if (description()) {
        <p class="mx-auto mt-1 max-w-md text-xs text-[#787676]">{{ description() }}</p>
      }
      @if (state() === 'error') {
        <button
          type="button"
          class="mt-4 text-sm font-semibold text-[#1350DF] hover:underline"
          (click)="retry.emit()"
        >
          Try again
        </button>
      }
    </section>
  `,
})
export class PageStateComponent {
  readonly state = input.required<PageState>();
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly retry = output<void>();
}
