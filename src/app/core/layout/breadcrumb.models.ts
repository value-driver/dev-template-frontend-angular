import { Params } from '@angular/router';

export interface BreadcrumbItem {
  readonly label: string;
  readonly url?: string;
  readonly icon?: string;
  readonly active?: boolean;
}

/** The route state available to dynamic title and breadcrumb labels. */
export interface RouteLabelContext {
  readonly params: Params;
  readonly queryParams: Params;
  readonly url: string;
}

/** A route label can be static or derived from the active route parameters. */
export type RouteLabel = string | ((context: RouteLabelContext) => string | null | undefined);

/** Set `breadcrumb: false` on a route that must not appear in the trail. */
export type BreadcrumbDefinition = RouteLabel | false;

export interface CurrentPageMetadata {
  readonly title?: string;
  readonly subtitle?: string | null;
  readonly breadcrumb?: string;
}

export type LayoutType = 'authenticated' | 'auth' | 'blank';
