import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline';
import { execSync } from 'node:child_process';

function toKebabCase(str) {
  return str
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

function toPascalCase(str) {
  return str
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function toCamelCase(str) {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toTitleCase(str) {
  return str
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function ask(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

function formatFiles(...fileOrDirPaths) {
  try {
    const prettierBin = join(process.cwd(), 'node_modules', 'prettier', 'bin', 'prettier.cjs');
    if (existsSync(prettierBin)) {
      const targets = fileOrDirPaths.map((p) => `"${p}"`).join(' ');
      execSync(`node "${prettierBin}" --write ${targets}`, { stdio: 'ignore' });
    }
  } catch {}
}

function autoRegisterRoute(featureName, pascalName, upperName, titleName) {
  const routesPath = join(process.cwd(), 'src', 'app', 'app.routes.ts');
  if (!existsSync(routesPath)) {
    return;
  }

  let content = readFileSync(routesPath, 'utf8');

  if (content.includes(`path: '${featureName}'`)) {
    console.log(`INFO: Route '${featureName}' is already registered in app.routes.ts`);
    return;
  }

  const routeBlock = `      {
        path: '${featureName}',
        data: {
          title: '${titleName}',
          subtitle: 'Manage ${featureName} operations',
          breadcrumb: '${titleName}',
        },
        loadChildren: () =>
          import('./features/${featureName}/${featureName}.routes').then(
            (m) => m.${upperName}_ROUTES,
          ),
      },`;

  const marker = '    children: [';
  const markerIdx = content.indexOf(marker);
  if (markerIdx !== -1) {
    const endChildrenMarker = '    ],';
    const endIdx = content.indexOf(endChildrenMarker, markerIdx);
    if (endIdx !== -1) {
      content = content.slice(0, endIdx) + routeBlock + '\n' + content.slice(endIdx);
      writeFileSync(routesPath, content, 'utf8');
      console.log(`AUTO-ROUTE: Registered lazy route '/${featureName}' in src/app/app.routes.ts`);
    }
  }
}

export function generateFeatureSlice(rawName) {
  const name = toKebabCase(rawName);
  if (!name || !/^[a-z][a-z0-9-]*$/.test(name)) {
    console.error('[ERROR] Please provide a valid kebab-case feature name.');
    return;
  }

  const pascalName = toPascalCase(name);
  const upperName = name.replace(/-/g, '_').toUpperCase();
  const titleName = toTitleCase(name);
  const featureRoot = join(process.cwd(), 'src', 'app', 'features', name);

  if (existsSync(featureRoot)) {
    console.error(`ERROR: Feature "${name}" already exists at ${featureRoot}`);
    return;
  }

  for (const dir of [
    'data-access',
    'models',
    'pages',
    join('pages', `${name}-list`),
    join('pages', `${name}-detail`),
    'state',
    'ui',
    join('ui', `${name}-table`),
  ]) {
    mkdirSync(join(featureRoot, dir), { recursive: true });
  }

  const modelContent = `export interface ${pascalName} {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly status: 'active' | 'pending' | 'archived';
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ${pascalName}Filter {
  readonly search?: string;
  readonly status?: ${pascalName}['status'];
}
`;

  const dataAccessContent = `import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '@core/http/api-client/api-client.service';
import { ${pascalName} } from '@features/${name}/models/${name}.models';

@Injectable({ providedIn: 'root' })
export class ${pascalName}ApiService {
  private readonly api = inject(ApiClient);

  getAll(): Observable<${pascalName}[]> {
    return this.api.get<${pascalName}[]>('api/v1/${name}');
  }

  getById(id: string): Observable<${pascalName}> {
    return this.api.get<${pascalName}>('api/v1/${name}/' + id);
  }

  create(payload: Partial<${pascalName}>): Observable<${pascalName}> {
    return this.api.post<${pascalName}, Partial<${pascalName}>>('api/v1/${name}', payload);
  }

  update(id: string, payload: Partial<${pascalName}>): Observable<${pascalName}> {
    return this.api.put<${pascalName}, Partial<${pascalName}>>('api/v1/${name}/' + id, payload);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>('api/v1/${name}/' + id);
  }
}
`;

  const dataAccessSpecContent = `import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it, beforeEach } from 'vitest';

import { ApiClient } from '@core/http/api-client/api-client.service';
import { ${pascalName} } from '@features/${name}/models/${name}.models';
import { ${pascalName}ApiService } from './${name}-api.service';

describe('${pascalName}ApiService', () => {
  let service: ${pascalName}ApiService;
  const mockApiClient = {
    get: () => of([]),
    post: (_url: string, body: Partial<${pascalName}>) => of({ id: '1', ...body } as ${pascalName}),
    put: (_url: string, body: Partial<${pascalName}>) => of({ id: '1', ...body } as ${pascalName}),
    delete: () => of(undefined),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ${pascalName}ApiService,
        { provide: ApiClient, useValue: mockApiClient },
      ],
    });
    service = TestBed.inject(${pascalName}ApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
`;

  const StateServiceContent = `import { inject, Injectable, signal, computed } from '@angular/core';
import { ${pascalName} } from '@features/${name}/models/${name}.models';
import { ${pascalName}ApiService } from '@features/${name}/data-access/${name}-api.service';

export interface ${pascalName}State {
  readonly items: ${pascalName}[];
  readonly selectedItem: ${pascalName} | null;
  readonly loading: boolean;
  readonly error: string | null;
}

const INITIAL_STATE: ${pascalName}State = {
  items: [],
  selectedItem: null,
  loading: false,
  error: null,
};

@Injectable({ providedIn: 'root' })
export class ${pascalName}StateService {
  private readonly api = inject(${pascalName}ApiService);
  private readonly state = signal<${pascalName}State>(INITIAL_STATE);

  readonly items = computed(() => this.state().items);
  readonly selectedItem = computed(() => this.state().selectedItem);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly totalCount = computed(() => this.state().items.length);

  loadAll(): void {
    this.state.update((s) => ({ ...s, loading: true, error: null }));
    this.api.getAll().subscribe({
      next: (items) => this.state.update((s) => ({ ...s, items, loading: false })),
      error: (err) => this.state.update((s) => ({ ...s, loading: false, error: err.message })),
    });
  }

  setItems(items: ${pascalName}[]): void {
    this.state.update((s) => ({ ...s, items }));
  }

  addItem(item: ${pascalName}): void {
    this.state.update((s) => ({ ...s, items: [item, ...s.items] }));
  }

  removeItem(id: string): void {
    this.state.update((s) => ({ ...s, items: s.items.filter((i) => i.id !== id) }));
  }
}
`;

  const StateServiceSpecContent = `import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it, beforeEach } from 'vitest';

import { ${pascalName}StateService } from './${name}-state.service';
import { ${pascalName}ApiService } from '@features/${name}/data-access/${name}-api.service';

describe('${pascalName}StateService', () => {
  let StateService: ${pascalName}StateService;
  const mockApi = {
    getAll: () => of([{ id: '1', name: 'Sample', code: 'SMP', status: 'active', createdAt: '2026-08-19', updatedAt: '2026-08-19' }]),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ${pascalName}StateService,
        { provide: ${pascalName}ApiService, useValue: mockApi },
      ],
    });
    StateService = TestBed.inject(${pascalName}StateService);
  });

  it('should initialize with empty items', () => {
    expect(StateService.items()).toEqual([]);
  });

  it('should add item to StateService state', () => {
    StateService.addItem({ id: '99', name: 'New Item', code: 'NEW', status: 'active', createdAt: '2026-08-19', updatedAt: '2026-08-19' });
    expect(StateService.totalCount()).toBe(1);
    expect(StateService.items()[0].name).toBe('New Item');
  });
});
`;

  const uiTableContent = `import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideEye, LucideTrash2 } from '@lucide/angular';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { ${pascalName} } from '@features/${name}/models/${name}.models';

@Component({
  selector: 'app-${name}-table',
  imports: [RouterLink, NzTableModule, NzTagModule, NzButtonModule, LucideTrash2, LucideEye],
  template: \`
    <nz-table #basicTable [nzData]="items()" [nzLoading]="loading()" nzSize="middle" class="border border-[#D2D2D2] rounded-xl overflow-hidden">
      <thead>
        <tr class="bg-[#F9F9F9] text-xs uppercase tracking-wider text-[#787676]">
          <th>Name & Code</th>
          <th>Status</th>
          <th>Created</th>
          <th>Updated</th>
          <th class="text-right">Actions</th>
        </tr>
      </thead>
      <tbody class="text-sm">
        @for (item of basicTable.data; track item.id) {
          <tr class="hover:bg-[#F9F9F9]">
            <td>
              <div class="font-semibold text-[#101828]">{{ item.name }}</div>
              <div class="text-[11px] font-mono text-[#787676]">{{ item.code }}</div>
            </td>
            <td>
              @switch (item.status) {
                @case ('active') {
                  <nz-tag nzColor="success">Active</nz-tag>
                }
                @case ('pending') {
                  <nz-tag nzColor="processing">Pending</nz-tag>
                }
                @default {
                  <nz-tag nzColor="default">Archived</nz-tag>
                }
              }
            </td>
            <td class="text-xs text-[#787676]">{{ item.createdAt }}</td>
            <td class="text-xs text-[#787676]">{{ item.updatedAt }}</td>
            <td class="text-right">
              <div class="inline-flex items-center gap-1">
                <a
                  [routerLink]="['/${name}', item.id]"
                  nz-button
                  nzType="text"
                  nzSize="small"
                  aria-label="View item details"
                >
                  <svg lucideEye class="h-4 w-4 text-[#1350DF]" aria-hidden="true"></svg>
                </a>
                <button
                  nz-button
                  nzType="text"
                  nzDanger
                  nzSize="small"
                  (click)="deleteItem.emit(item)"
                  aria-label="Delete item"
                >
                  <svg lucideTrash2 class="h-4 w-4" aria-hidden="true"></svg>
                </button>
              </div>
            </td>
          </tr>
        }
      </tbody>
    </nz-table>
  \`,
})
export class ${pascalName}TableComponent {
  readonly items = input.required<${pascalName}[]>();
  readonly loading = input<boolean>(false);
  readonly deleteItem = output<${pascalName}>();
}
`;

  const uiTableSpecContent = `import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, beforeEach } from 'vitest';

import { ${pascalName}TableComponent } from './${name}-table.component';

describe('${pascalName}TableComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [${pascalName}TableComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should render table', () => {
    const fixture = TestBed.createComponent(${pascalName}TableComponent);
    fixture.componentRef.setInput('items', []);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
`;

  const listPageContent = `import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucidePlus, LucideRefreshCw } from '@lucide/angular';
import { NzButtonModule } from 'ng-zorro-antd/button';

import { DialogService } from '@core/feedback/dialog.service';
import { ToastService } from '@core/feedback/toast.service';
import { ${pascalName} } from '@features/${name}/models/${name}.models';
import { ${pascalName}StateService } from '@features/${name}/state/${name}-state.service';
import { ${pascalName}TableComponent } from '@features/${name}/ui/${name}-table/${name}-table.component';

const INITIAL_MOCK: ${pascalName}[] = [
  { id: '1', name: '${titleName} Primary', code: '${upperName}-01', status: 'active', createdAt: '2026-08-19', updatedAt: '2026-08-19' },
  { id: '2', name: '${titleName} Secondary', code: '${upperName}-02', status: 'pending', createdAt: '2026-08-18', updatedAt: '2026-08-19' },
];

@Component({
  selector: 'app-${name}-list-page',
  imports: [RouterLink, NzButtonModule, LucidePlus, LucideRefreshCw, ${pascalName}TableComponent],
  template: \`
    <div class="grid gap-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-[#101828]">${titleName} Directory</h2>
          <p class="text-xs text-[#787676]">
            Manage enterprise ${name} records and access control policies
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button nz-button nzType="default" (click)="refresh()" class="text-xs">
            <svg lucideRefreshCw class="h-3.5 w-3.5" aria-hidden="true"></svg>
            <span>Refresh</span>
          </button>
          <a [routerLink]="['/${name}', 'new']" nz-button nzType="primary" class="bg-[#1350DF] text-xs">
            <svg lucidePlus class="h-3.5 w-3.5" aria-hidden="true"></svg>
            <span>New ${pascalName}</span>
          </a>
        </div>
      </div>

      <app-${name}-table
        [items]="StateService.items()"
        [loading]="StateService.loading()"
        (deleteItem)="onDelete($event)"
      />
    </div>
  \`,
})
export class ${pascalName}ListPageComponent implements OnInit {
  protected readonly StateService = inject(${pascalName}StateService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(DialogService);

  ngOnInit(): void {
    if (this.StateService.items().length === 0) {
      this.StateService.setItems(INITIAL_MOCK);
    }
  }

  refresh(): void {
    this.toast.info('${titleName} records refreshed');
  }

  async onDelete(item: ${pascalName}): Promise<void> {
    const confirmed = await this.dialog.deleteConfirm(item.name);
    if (confirmed) {
      this.StateService.removeItem(item.id);
      this.toast.success('Deleted "' + item.name + '"');
    }
  }
}
`;

  const listPageSpecContent = `import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, beforeEach } from 'vitest';

import { ${pascalName}ListPageComponent } from './${name}-list-page.component';
import { ${pascalName}StateService } from '@features/${name}/state/${name}-state.service';
import { ToastService } from '@core/feedback/toast.service';
import { DialogService } from '@core/feedback/dialog.service';

describe('${pascalName}ListPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [${pascalName}ListPageComponent],
      providers: [
        provideRouter([]),
        { provide: ${pascalName}StateService, useValue: { items: () => [], loading: () => false, setItems: () => {}, removeItem: () => {} } },
        { provide: ToastService, useValue: { info: () => {}, success: () => {} } },
        { provide: DialogService, useValue: { deleteConfirm: () => Promise.resolve(true) } },
      ],
    }).compileComponents();
  });

  it('should create list page', () => {
    const fixture = TestBed.createComponent(${pascalName}ListPageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
`;

  const detailPageContent = `import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideSave } from '@lucide/angular';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { ToastService } from '@core/feedback/toast.service';
import { ${pascalName} } from '@features/${name}/models/${name}.models';
import { ${pascalName}StateService } from '@features/${name}/state/${name}-state.service';

@Component({
  selector: 'app-${name}-detail-page',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    LucideArrowLeft,
    LucideSave,
  ],
  template: \`
    <div class="mx-auto max-w-3xl grid gap-6">
      <div class="flex items-center justify-between">
        <a [routerLink]="['/${name}']" nz-button nzType="default" class="text-xs">
          <svg lucideArrowLeft class="h-3.5 w-3.5" aria-hidden="true"></svg>
          <span>Back to ${titleName}</span>
        </a>
        <h2 class="text-lg font-bold text-[#101828]">
          {{ isNew() ? 'Create ${pascalName}' : 'Edit ${pascalName}' }}
        </h2>
      </div>

      <nz-card class="border border-[#D2D2D2] rounded-xl">
        <form [formGroup]="form" (ngSubmit)="onSave()" class="grid gap-4">
          <div>
            <label class="mb-1 block text-xs font-semibold text-[#333333]">${titleName} Name</label>
            <input nz-input formControlName="name" class="h-10 rounded-lg" />
          </div>

          <div>
            <label class="mb-1 block text-xs font-semibold text-[#333333]">Identifier Code</label>
            <input nz-input formControlName="code" class="h-10 rounded-lg" />
          </div>

          <div>
            <label class="mb-1 block text-xs font-semibold text-[#333333]">Status</label>
            <nz-select formControlName="status" class="w-full">
              <nz-option nzValue="active" nzLabel="Active"></nz-option>
              <nz-option nzValue="pending" nzLabel="Pending"></nz-option>
              <nz-option nzValue="archived" nzLabel="Archived"></nz-option>
            </nz-select>
          </div>

          <div class="mt-4 flex justify-end gap-2 border-t border-[#D2D2D2] pt-4">
            <a [routerLink]="['/${name}']" nz-button nzType="default" class="text-xs">Cancel</a>
            <button nz-button nzType="primary" class="bg-[#1350DF] text-xs">
              <svg lucideSave class="h-3.5 w-3.5" aria-hidden="true"></svg>
              <span>Save Record</span>
            </button>
          </div>
        </form>
      </nz-card>
    </div>
  \`,
})
export class ${pascalName}DetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly StateService = inject(${pascalName}StateService);
  private readonly toast = inject(ToastService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly isNew = signal(this.route.snapshot.paramMap.get('id') === 'new');
  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['Enterprise ${titleName}', [Validators.required]],
    code: ['${upperName}-01', [Validators.required]],
    status: ['active' as ${pascalName}['status'], [Validators.required]],
  });

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name: itemName, code, status } = this.form.getRawValue();
    if (this.isNew()) {
      this.StateService.addItem({
        id: String(Date.now()),
        name: itemName,
        code,
        status,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      });
      this.toast.success('Created "' + itemName + '" successfully');
    } else {
      this.toast.success('Updated "' + itemName + '" successfully');
    }
    void this.router.navigate(['/${name}']);
  }
}
`;

  const detailPageSpecContent = `import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { describe, expect, it, beforeEach } from 'vitest';

import { ${pascalName}DetailPageComponent } from './${name}-detail-page.component';
import { ${pascalName}StateService } from '@features/${name}/state/${name}-state.service';
import { ToastService } from '@core/feedback/toast.service';

describe('${pascalName}DetailPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [${pascalName}DetailPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'new' } } },
        },
        { provide: ${pascalName}StateService, useValue: { addItem: () => {} } },
        { provide: ToastService, useValue: { success: () => {} } },
      ],
    }).compileComponents();
  });

  it('should create detail page', () => {
    const fixture = TestBed.createComponent(${pascalName}DetailPageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
`;

  const routesContent = `import { Routes } from '@angular/router';
import { ${pascalName}ListPageComponent } from './pages/${name}-list/${name}-list-page.component';
import { ${pascalName}DetailPageComponent } from './pages/${name}-detail/${name}-detail-page.component';

export const ${upperName}_ROUTES: Routes = [
  {
    path: '',
    component: ${pascalName}ListPageComponent,
    data: {
      title: '${titleName}',
      breadcrumb: '${titleName}',
    },
  },
  {
    path: ':id',
    component: ${pascalName}DetailPageComponent,
    data: {
      title: '${titleName} Details',
      breadcrumb: 'Details',
    },
  },
];
`;

  writeFileSync(join(featureRoot, 'models', `${name}.models.ts`), modelContent, 'utf8');
  writeFileSync(
    join(featureRoot, 'data-access', `${name}-api.service.ts`),
    dataAccessContent,
    'utf8',
  );
  writeFileSync(
    join(featureRoot, 'data-access', `${name}-api.service.spec.ts`),
    dataAccessSpecContent,
    'utf8',
  );
  writeFileSync(
    join(featureRoot, 'state', `${name}-state.service.ts`),
    StateServiceContent,
    'utf8',
  );
  writeFileSync(
    join(featureRoot, 'state', `${name}-state.service.spec.ts`),
    StateServiceSpecContent,
    'utf8',
  );
  writeFileSync(
    join(featureRoot, 'ui', `${name}-table`, `${name}-table.component.ts`),
    uiTableContent,
    'utf8',
  );
  writeFileSync(
    join(featureRoot, 'ui', `${name}-table`, `${name}-table.component.spec.ts`),
    uiTableSpecContent,
    'utf8',
  );
  writeFileSync(
    join(featureRoot, 'pages', `${name}-list`, `${name}-list-page.component.ts`),
    listPageContent,
    'utf8',
  );
  writeFileSync(
    join(featureRoot, 'pages', `${name}-list`, `${name}-list-page.component.spec.ts`),
    listPageSpecContent,
    'utf8',
  );
  writeFileSync(
    join(featureRoot, 'pages', `${name}-detail`, `${name}-detail-page.component.ts`),
    detailPageContent,
    'utf8',
  );
  writeFileSync(
    join(featureRoot, 'pages', `${name}-detail`, `${name}-detail-page.component.spec.ts`),
    detailPageSpecContent,
    'utf8',
  );
  writeFileSync(join(featureRoot, `${name}.routes.ts`), routesContent, 'utf8');

  console.log(`[SUCCESS] Generated complete CRUD feature slice for '${name}'!`);
  autoRegisterRoute(name, pascalName, upperName, titleName);
  formatFiles(featureRoot, join(process.cwd(), 'src', 'app', 'app.routes.ts'));
}

export function generatePageComponent(featureName, pageName) {
  const fName = toKebabCase(featureName);
  const pName = toKebabCase(pageName);
  const pascalName = toPascalCase(pName);
  const titleName = toTitleCase(pName);
  const targetDir = join(process.cwd(), 'src', 'app', 'features', fName, 'pages', `${pName}-page`);

  mkdirSync(targetDir, { recursive: true });

  const componentContent = `import { Component, inject, signal } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';

import { ToastService } from '@core/feedback/toast.service';

@Component({
  selector: 'app-${pName}-page',
  imports: [NzCardModule, NzButtonModule],
  template: \`
    <div class="grid gap-6">
      <header>
        <h2 class="text-xl font-bold text-[#101828]">${titleName}</h2>
        <p class="text-xs text-[#787676]">Managed page view in ${fName}</p>
      </header>

      <nz-card class="border border-[#D2D2D2] rounded-xl">
        <p class="text-sm text-[#333333]">Page content goes here.</p>
      </nz-card>
    </div>
  \`,
})
export class ${pascalName}PageComponent {
  private readonly toast = inject(ToastService);
  protected readonly loading = signal(false);
}
`;

  const specContent = `import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, beforeEach } from 'vitest';

import { ${pascalName}PageComponent } from './${pName}-page.component';
import { ToastService } from '@core/feedback/toast.service';

describe('${pascalName}PageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [${pascalName}PageComponent],
      providers: [
        provideRouter([]),
        { provide: ToastService, useValue: { success: () => {}, error: () => {} } },
      ],
    }).compileComponents();
  });

  it('should create component', () => {
    const fixture = TestBed.createComponent(${pascalName}PageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
`;

  writeFileSync(join(targetDir, `${pName}-page.component.ts`), componentContent, 'utf8');
  writeFileSync(join(targetDir, `${pName}-page.component.spec.ts`), specContent, 'utf8');
  console.log(
    `[SUCCESS] Generated page component at src/app/features/${fName}/pages/${pName}-page/`,
  );
  formatFiles(targetDir);
}

export function generateUiComponent(featureName, componentName) {
  const fName = toKebabCase(featureName);
  const cName = toKebabCase(componentName);
  const pascalName = toPascalCase(cName);
  const targetDir = join(process.cwd(), 'src', 'app', 'features', fName, 'ui', cName);

  mkdirSync(targetDir, { recursive: true });

  const componentContent = `import { Component, input, output } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-${cName}',
  imports: [NzButtonModule],
  template: \`
    <div class="rounded-xl border border-[#D2D2D2] bg-white p-4">
      <div class="text-sm font-semibold text-[#101828]">{{ title() }}</div>
      <button nz-button nzType="default" (click)="action.emit()" class="mt-3 text-xs">
        Trigger Action
      </button>
    </div>
  \`,
})
export class ${pascalName}Component {
  readonly title = input<string>('${toTitleCase(cName)}');
  readonly action = output<void>();
}
`;

  const specContent = `import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';

import { ${pascalName}Component } from './${cName}.component';

describe('${pascalName}Component', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [${pascalName}Component],
    }).compileComponents();
  });

  it('should create UI component with inputs', () => {
    const fixture = TestBed.createComponent(${pascalName}Component);
    fixture.componentRef.setInput('title', 'Test Title');
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
`;

  writeFileSync(join(targetDir, `${cName}.component.ts`), componentContent, 'utf8');
  writeFileSync(join(targetDir, `${cName}.component.spec.ts`), specContent, 'utf8');
  console.log(
    `[SUCCESS] Generated presentation UI component at src/app/features/${fName}/ui/${cName}/`,
  );
  formatFiles(targetDir);
}

export function generateService(featureName, serviceName) {
  const fName = toKebabCase(featureName);
  const sName = toKebabCase(serviceName);
  const pascalName = toPascalCase(sName);
  const targetDir = join(process.cwd(), 'src', 'app', 'features', fName, 'data-access');

  mkdirSync(targetDir, { recursive: true });

  const serviceContent = `import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '@core/http/api-client/api-client.service';

@Injectable({ providedIn: 'root' })
export class ${pascalName}ApiService {
  private readonly api = inject(ApiClient);

  getData(): Observable<unknown[]> {
    return this.api.get<unknown[]>('api/v1/${sName}');
  }
}
`;

  const specContent = `import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it, beforeEach } from 'vitest';

import { ApiClient } from '@core/http/api-client/api-client.service';
import { ${pascalName}ApiService } from './${sName}-api.service';

describe('${pascalName}ApiService', () => {
  let service: ${pascalName}ApiService;
  const mockApi = { get: () => of([]) };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ${pascalName}ApiService,
        { provide: ApiClient, useValue: mockApi },
      ],
    });
    service = TestBed.inject(${pascalName}ApiService);
  });

  it('should create data service', () => {
    expect(service).toBeTruthy();
  });
});
`;

  writeFileSync(join(targetDir, `${sName}-api.service.ts`), serviceContent, 'utf8');
  writeFileSync(join(targetDir, `${sName}-api.service.spec.ts`), specContent, 'utf8');
  console.log(
    `[SUCCESS] Generated data-access service at src/app/features/${fName}/data-access/${sName}-api.service.ts`,
  );
  formatFiles(
    join(targetDir, `${sName}-api.service.ts`),
    join(targetDir, `${sName}-api.service.spec.ts`),
  );
}

export function generateStateService(featureName, StateServiceName) {
  const fName = toKebabCase(featureName);
  const sName = toKebabCase(StateServiceName);
  const pascalName = toPascalCase(sName);
  const targetDir = join(process.cwd(), 'src', 'app', 'features', fName, 'state');

  mkdirSync(targetDir, { recursive: true });

  const StateServiceContent = `import { Injectable, signal, computed } from '@angular/core';

export interface ${pascalName}State {
  readonly data: unknown[];
  readonly loading: boolean;
  readonly error: string | null;
}

const INITIAL_STATE: ${pascalName}State = {
  data: [],
  loading: false,
  error: null,
};

@Injectable({ providedIn: 'root' })
export class ${pascalName}StateService {
  private readonly state = signal<${pascalName}State>(INITIAL_STATE);

  readonly data = computed(() => this.state().data);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  setData(data: unknown[]): void {
    this.state.update((s) => ({ ...s, data }));
  }

  setLoading(loading: boolean): void {
    this.state.update((s) => ({ ...s, loading }));
  }
}
`;

  const specContent = `import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';

import { ${pascalName}StateService } from './${sName}-state.service';

describe('${pascalName}StateService', () => {
  let StateService: ${pascalName}StateService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [${pascalName}StateService] });
    StateService = TestBed.inject(${pascalName}StateService);
  });

  it('should initialize with default state', () => {
    expect(StateService.data()).toEqual([]);
    expect(StateService.loading()).toBe(false);
  });
});
`;

  writeFileSync(join(targetDir, `${sName}-state.service.ts`), StateServiceContent, 'utf8');
  writeFileSync(join(targetDir, `${sName}-state.service.spec.ts`), specContent, 'utf8');
  console.log(
    `[SUCCESS] Generated signal state service at src/app/features/${fName}/state/${sName}-state.service.ts`,
  );
  formatFiles(
    join(targetDir, `${sName}-state.service.ts`),
    join(targetDir, `${sName}-state.service.spec.ts`),
  );
}

async function runInteractiveCli() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('\n========================================');
  console.log('  Enterprise Angular Developer CLI');
  console.log('========================================\n');
  console.log('? What would you like to generate?');
  console.log('  1) Full Feature Slice (CRUD Page + Data Access + StateService + Routes + Spec)');
  console.log('  2) Smart Page Component (Signals-first + ApiClient + OnPush + Spec)');
  console.log('  3) Presentation UI Component (input/output Signals + OnPush + Spec)');
  console.log('  4) Data-Access API Service (Typed CRUD methods with ApiClient + Spec)');
  console.log('  5) Feature State Service (Typed State + Spec)');
  console.log('  6) Run Architecture & Environment Doctor');
  console.log('  7) Import / Update API (Swagger / OpenAPI / Postman -> Endpoints & Types)');
  console.log('  0) Exit\n');

  const choice = await ask(rl, 'Select an option (0-7): ');

  switch (choice.trim()) {
    case '1': {
      const name = await ask(rl, 'Feature name (e.g. customer-accounts): ');
      if (name) generateFeatureSlice(name);
      break;
    }
    case '2': {
      const fName = await ask(rl, 'Feature folder name: ');
      const pName = await ask(rl, 'Page name (e.g. audit-logs): ');
      if (fName && pName) generatePageComponent(fName, pName);
      break;
    }
    case '3': {
      const fName = await ask(rl, 'Feature folder name: ');
      const cName = await ask(rl, 'Component name (e.g. status-badge): ');
      if (fName && cName) generateUiComponent(fName, cName);
      break;
    }
    case '4': {
      const fName = await ask(rl, 'Feature folder name: ');
      const sName = await ask(rl, 'Service name (e.g. billing): ');
      if (fName && sName) generateService(fName, sName);
      break;
    }
    case '5': {
      const fName = await ask(rl, 'Feature folder name: ');
      const sName = await ask(rl, 'StateService name (e.g. billing): ');
      if (fName && sName) generateStateService(fName, sName);
      break;
    }
    case '6': {
      const { execSync } = await import('node:child_process');
      try {
        execSync('node scripts/doctor.mjs', { stdio: 'inherit' });
      } catch {}
      break;
    }
    case '7': {
      const { runApiImport } = await import('./api-importer.mjs');
      const metaFile = join(process.cwd(), 'openapi', 'api-source.json');
      let defaultHint = '';
      if (existsSync(metaFile)) {
        try {
          const saved = JSON.parse(readFileSync(metaFile, 'utf8'));
          if (saved.source) defaultHint = ` [Enter for saved: ${saved.source}]`;
        } catch {}
      }
      const source = await ask(rl, `API Specification URL or File Path${defaultHint}: `);
      await runApiImport(source);
      break;
    }
    case '0':
    default:
      console.log('Exiting CLI.');
      break;
  }

  rl.close();
}

const args = process.argv.slice(2);
const command = args[0];

if (!command) {
  runInteractiveCli();
} else if (command === 'import-api' || command === 'api:import') {
  const sourceArg = args.find((a) => a.startsWith('--source='))?.split('=')[1] || args[1];
  const { runApiImport } = await import('./api-importer.mjs');
  await runApiImport(sourceArg);
} else if (command === 'update-api' || command === 'api:update') {
  const { runApiImport } = await import('./api-importer.mjs');
  await runApiImport(null);
} else if (command === 'feature') {
  const name = args[1];
  if (!name) {
    console.error('Usage: npm run generate:feature -- <feature-name>');
  } else {
    generateFeatureSlice(name);
  }
} else if (command === 'page') {
  const target = args[1];
  if (!target || !target.includes('/')) {
    console.error('Usage: npm run generate:page -- <feature-name>/<page-name>');
  } else {
    const [fName, pName] = target.split('/');
    generatePageComponent(fName, pName);
  }
} else if (command === 'component') {
  const target = args[1];
  if (!target || !target.includes('/')) {
    console.error('Usage: npm run generate:component -- <feature-name>/<component-name>');
  } else {
    const [fName, cName] = target.split('/');
    generateUiComponent(fName, cName);
  }
} else if (command === 'service') {
  const target = args[1];
  if (!target || !target.includes('/')) {
    console.error('Usage: npm run generate:service -- <feature-name>/<service-name>');
  } else {
    const [fName, sName] = target.split('/');
    generateService(fName, sName);
  }
} else if (command === 'state') {
  const target = args[1];
  if (!target || !target.includes('/')) {
    console.error('Usage: npm run generate:state -- <feature-name>/<state-name>');
  } else {
    const [fName, sName] = target.split('/');
    generateStateService(fName, sName);
  }
} else {
  generateFeatureSlice(command);
}
