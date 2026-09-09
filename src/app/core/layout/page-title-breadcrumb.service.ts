import { inject, Injectable, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

import {
  BreadcrumbDefinition,
  BreadcrumbItem,
  CurrentPageMetadata,
  LayoutType,
  RouteLabel,
  RouteLabelContext,
} from '@core/layout/breadcrumb.models';

const APP_TITLE_SUFFIX = 'Enterprise Starter';

@Injectable({ providedIn: 'root' })
export class PageTitleBreadcrumbService {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly titleService = inject(Title);

  private readonly breadcrumbsSignal = signal<BreadcrumbItem[]>([]);
  private readonly pageTitleSignal = signal<string>('Dashboard');
  private readonly pageSubtitleSignal = signal<string | null>(null);
  private readonly currentLayoutSignal = signal<LayoutType>('authenticated');

  readonly breadcrumbs = this.breadcrumbsSignal.asReadonly();
  readonly pageTitle = this.pageTitleSignal.asReadonly();
  readonly pageSubtitle = this.pageSubtitleSignal.asReadonly();
  readonly currentLayout = this.currentLayoutSignal.asReadonly();

  initialize(): void {
    this.updateRouteMetadata();
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateRouteMetadata();
      });
  }

  // Ignore late page-load responses after the user has navigated away.
  setCurrentPageMetadata(metadata: CurrentPageMetadata, expectedUrl = this.router.url): void {
    if (this.router.url !== expectedUrl) return;

    const title = metadata.title?.trim() || metadata.breadcrumb?.trim() || this.pageTitleSignal();
    const subtitle =
      metadata.subtitle === undefined ? this.pageSubtitleSignal() : metadata.subtitle;
    const breadcrumb = metadata.breadcrumb?.trim();
    const breadcrumbs = this.breadcrumbsSignal();

    if (breadcrumb && breadcrumbs.length > 0) {
      this.breadcrumbsSignal.set([
        ...breadcrumbs.slice(0, -1),
        { ...breadcrumbs.at(-1)!, label: breadcrumb, active: true, url: undefined },
      ]);
    }

    this.pageTitleSignal.set(title);
    this.pageSubtitleSignal.set(subtitle);
    this.titleService.setTitle(`${title} · ${APP_TITLE_SUFFIX}`);
  }

  private updateRouteMetadata(): void {
    let currentRoute: ActivatedRoute | null = this.activatedRoute.root;
    const breadcrumbItems: BreadcrumbItem[] = [];
    let title = 'Dashboard';
    let hasRouteTitle = false;
    let subtitle: string | null = null;
    let layout: LayoutType = 'authenticated';
    let cumulativeUrl = '';

    while (currentRoute) {
      const snapshot = currentRoute.snapshot;
      // Direct route data prevents duplicate labels from empty-path lazy routes.
      const routeData = snapshot.routeConfig?.data ?? {};
      const urlSegments = snapshot.url.map((s) => s.path);

      if (urlSegments.length > 0) {
        cumulativeUrl += '/' + urlSegments.join('/');
      }

      if (routeData) {
        if (routeData['layout']) {
          layout = routeData['layout'] as LayoutType;
        }

        const context = this.createLabelContext(
          snapshot.params,
          snapshot.queryParams,
          cumulativeUrl,
        );
        const routeTitle = this.resolveRouteLabel(
          routeData['title'] as RouteLabel | undefined,
          context,
        );
        const routeSubtitle = this.resolveRouteLabel(
          routeData['subtitle'] as RouteLabel | undefined,
          context,
        );

        if (routeTitle) {
          title = routeTitle;
          hasRouteTitle = true;
        }

        if (routeSubtitle) {
          subtitle = routeSubtitle;
        }

        const breadcrumb = routeData['breadcrumb'] as BreadcrumbDefinition | undefined;
        const label =
          breadcrumb === false
            ? null
            : (this.resolveRouteLabel(breadcrumb, context) ?? this.fallbackLabel(urlSegments));

        if (label) {
          breadcrumbItems.push({
            label,
            url: cumulativeUrl || '/',
            active: false,
          });
        }
      }

      currentRoute = currentRoute.firstChild;
    }

    if (breadcrumbItems.length > 0) {
      breadcrumbItems[breadcrumbItems.length - 1] = {
        ...breadcrumbItems[breadcrumbItems.length - 1],
        active: true,
        url: undefined,
      };
    }

    this.breadcrumbsSignal.set(breadcrumbItems);
    this.pageTitleSignal.set(hasRouteTitle ? title : (breadcrumbItems.at(-1)?.label ?? title));
    this.pageSubtitleSignal.set(subtitle);
    this.currentLayoutSignal.set(layout);

    this.titleService.setTitle(`${this.pageTitleSignal()} · ${APP_TITLE_SUFFIX}`);
  }

  private createLabelContext(
    params: Record<string, string>,
    queryParams: Record<string, string>,
    url: string,
  ): RouteLabelContext {
    return { params, queryParams, url };
  }

  private resolveRouteLabel(
    label: RouteLabel | undefined,
    context: RouteLabelContext,
  ): string | null {
    try {
      const value = typeof label === 'function' ? label(context) : label;
      return typeof value === 'string' && value.trim() ? value.trim() : null;
    } catch {
      return null;
    }
  }

  private fallbackLabel(urlSegments: string[]): string | null {
    const segment = urlSegments.at(-1);
    if (!segment) return null;

    let decodedSegment = segment;
    try {
      decodedSegment = decodeURIComponent(segment);
    } catch {
      // The original, still-readable URL segment is a safe fallback.
    }

    return decodedSegment
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (character) => character.toUpperCase());
  }
}
