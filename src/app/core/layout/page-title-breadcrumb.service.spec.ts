import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { provideRouter, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { PageTitleBreadcrumbService } from '@core/layout/page-title-breadcrumb.service';

@Component({ template: '' })
class TestPageComponent {}

describe('PageTitleBreadcrumbService', () => {
  let service: PageTitleBreadcrumbService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), PageTitleBreadcrumbService, Title],
    });
    service = TestBed.inject(PageTitleBreadcrumbService);
  });

  it('should provide default reactive layout and title signals', () => {
    expect(service.currentLayout()).toBe('authenticated');
    expect(service.pageTitle()).toBe('Dashboard');
    expect(service.breadcrumbs()).toEqual([]);
  });

  it('builds a navigable trail and resolves parameter-aware labels', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'projects',
            data: { breadcrumb: 'Projects' },
            children: [
              {
                path: '',
                children: [
                  {
                    path: ':id',
                    component: TestPageComponent,
                    data: {
                      title: ({ params }: { params: Record<string, string> }) =>
                        `Project ${params['id']}`,
                      breadcrumb: ({ params }: { params: Record<string, string> }) =>
                        `Project ${params['id']}`,
                    },
                  },
                ],
              },
            ],
          },
        ]),
        PageTitleBreadcrumbService,
        Title,
      ],
    });

    service = TestBed.inject(PageTitleBreadcrumbService);
    const router = TestBed.inject(Router);
    service.initialize();

    await router.navigateByUrl('/projects/platform-api');

    expect(service.pageTitle()).toBe('Project platform-api');
    expect(service.breadcrumbs()).toEqual([
      { label: 'Projects', url: '/projects', active: false },
      { label: 'Project platform-api', active: true, url: undefined },
    ]);

    service.setCurrentPageMetadata({
      title: 'Platform API',
      breadcrumb: 'Platform API',
      subtitle: 'Shared API gateway',
    });

    expect(service.pageTitle()).toBe('Platform API');
    expect(service.pageSubtitle()).toBe('Shared API gateway');
    expect(service.breadcrumbs()).toEqual([
      { label: 'Projects', url: '/projects', active: false },
      { label: 'Platform API', active: true, url: undefined },
    ]);
  });
});
