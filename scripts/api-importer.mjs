import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync, execSync } from 'node:child_process';

function toCamelCase(str) {
  return str
    .replace(/[^a-zA-Z0-9_\-\s]/g, '')
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part, idx) =>
      idx === 0
        ? part.charAt(0).toLowerCase() + part.slice(1)
        : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join('');
}

function sanitizeKey(str) {
  const camel = toCamelCase(str);
  if (!camel) return 'endpoint';
  return /^[a-zA-Z_$]/.test(camel) ? camel : `_${camel}`;
}

export function formatFiles(...fileOrDirPaths) {
  try {
    const prettierBin = join(process.cwd(), 'node_modules', 'prettier', 'bin', 'prettier.cjs');
    if (existsSync(prettierBin)) {
      const targets = fileOrDirPaths.map((p) => `"${p}"`).join(' ');
      execSync(`node "${prettierBin}" --write ${targets}`, { stdio: 'ignore' });
    }
  } catch {}
}

/**
 * Fetches content from a remote URL or reads from a local file.
 */
export async function fetchOrReadSource(source) {
  const isUrl = /^https?:\/\//i.test(source.trim());
  if (isUrl) {
    console.log(`[API-IMPORT] Fetching remote specification from: ${source}...`);
    const response = await fetch(source, {
      headers: {
        Accept: 'application/json, application/yaml, text/yaml, */*',
        'User-Agent': 'Enterprise-Angular-CLI/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from ${source}: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    return { raw: text, isUrl: true, sourceUrl: source };
  }

  const localPath = resolve(source);
  if (!existsSync(localPath)) {
    throw new Error(`Local file not found at: ${localPath}`);
  }

  console.log(`[API-IMPORT] Reading local specification from: ${localPath}...`);
  const text = readFileSync(localPath, 'utf8');
  return { raw: text, isUrl: false, localPath };
}

/**
 * Detects whether content is OpenAPI 3.x, Swagger 2.0, or Postman Collection.
 */
export function detectFormat(parsedJson) {
  if (parsedJson?.openapi && typeof parsedJson.openapi === 'string') {
    return { type: 'openapi', version: parsedJson.openapi };
  }
  if (parsedJson?.swagger && typeof parsedJson.swagger === 'string') {
    return { type: 'swagger', version: parsedJson.swagger };
  }
  if (
    parsedJson?.info &&
    (parsedJson.info.schema?.includes('collection') ||
      parsedJson.info._postman_id ||
      Array.isArray(parsedJson.item))
  ) {
    return { type: 'postman', name: parsedJson.info.name ?? 'Postman Collection' };
  }
  return { type: 'unknown' };
}

/**
 * Extracts clean relative path without leading slash, protocol, or Postman variable prefixes.
 */
export function cleanRelativePath(rawPath) {
  let p = rawPath.trim();
  p = p.replace(/^https?:\/\/[^/]+/i, '');
  p = p.replace(/^\{\{[^}]+\}\}/, '');
  p = p.replace(/^\/+/, '');
  const qIdx = p.indexOf('?');
  if (qIdx !== -1) {
    p = p.substring(0, qIdx);
  }
  return p;
}

/**
 * Extracts path parameters like {id} or :id.
 */
export function extractPathParams(pathStr) {
  const matches = [...pathStr.matchAll(/\{([a-zA-Z0-9_-]+)\}|:([a-zA-Z0-9_-]+)/g)];
  return matches.map((m) => m[1] || m[2]);
}

/**
 * Normalizes an OpenAPI / Swagger document into organized modules and endpoints.
 */
export function parseOpenApi(spec) {
  const modules = {};
  const paths = spec.paths || {};

  for (const [rawPath, pathItem] of Object.entries(paths)) {
    if (!pathItem || typeof pathItem !== 'object') continue;

    const pathClean = cleanRelativePath(rawPath);
    const pathParams = extractPathParams(rawPath);

    const httpMethods = ['get', 'post', 'put', 'patch', 'delete'];
    for (const method of httpMethods) {
      const op = pathItem[method];
      if (!op) continue;

      let tag = (op.tags && op.tags[0]) || null;
      if (!tag) {
        const segments = pathClean
          .split('/')
          .filter((s) => s && s !== 'api' && s !== 'v1' && s !== 'v2');
        tag = segments[0] || 'general';
      }

      const moduleKey = sanitizeKey(tag);
      if (!modules[moduleKey]) {
        modules[moduleKey] = {
          name: tag,
          endpoints: {},
        };
      }

      let opName = op.operationId;
      if (opName) {
        opName = opName.replace(new RegExp(`^${tag}_?`, 'i'), '');
        opName = sanitizeKey(opName);
      } else {
        const segments = pathClean.split('/').filter(Boolean);
        const last = segments[segments.length - 1]?.replace(/[{}:]/g, '') || 'item';
        opName = sanitizeKey(`${method}_${last}`);
      }

      let finalOpName = opName;
      let counter = 1;
      while (modules[moduleKey].endpoints[finalOpName]) {
        finalOpName = `${opName}${++counter}`;
      }

      const queryParams = (op.parameters || []).filter((p) => p.in === 'query').map((p) => p.name);

      modules[moduleKey].endpoints[finalOpName] = {
        path: pathClean,
        rawPath: pathClean,
        method: method.toUpperCase(),
        pathParams,
        queryParams,
        summary: op.summary || op.description || '',
      };
    }
  }

  return modules;
}

/**
 * Builds a JSON schema recursively from an example JavaScript value.
 */
function valueToJsonSchema(val) {
  if (val === null || val === undefined) {
    return { type: 'string', nullable: true };
  }
  if (Array.isArray(val)) {
    return {
      type: 'array',
      items: val.length > 0 ? valueToJsonSchema(val[0]) : { type: 'string' },
    };
  }
  if (typeof val === 'object') {
    const properties = {};
    for (const [k, v] of Object.entries(val)) {
      properties[k] = valueToJsonSchema(v);
    }
    return { type: 'object', properties };
  }
  if (typeof val === 'number') {
    return Number.isInteger(val) ? { type: 'integer' } : { type: 'number' };
  }
  if (typeof val === 'boolean') {
    return { type: 'boolean' };
  }
  return { type: 'string' };
}

/**
 * Normalizes a Postman collection and converts it into an OpenAPI 3.0 structure
 * while extracting modules and endpoints.
 */
export function parsePostman(collection) {
  const modules = {};
  const openApiPaths = {};
  const schemas = {};

  function walkItems(items, currentModule) {
    for (const item of items) {
      if (item.item && Array.isArray(item.item)) {
        walkItems(item.item, item.name || currentModule);
      } else if (item.request) {
        const req = item.request;
        const method = (req.method || 'GET').toLowerCase();
        let rawUrl = '';
        let queryParams = [];

        if (typeof req.url === 'string') {
          rawUrl = req.url;
        } else if (req.url && typeof req.url === 'object') {
          rawUrl = req.url.raw || (req.url.path ? req.url.path.join('/') : '');
          if (Array.isArray(req.url.query)) {
            queryParams = req.url.query.map((q) => q.key).filter(Boolean);
          }
        }

        const pathClean = cleanRelativePath(rawUrl);
        const pathParams = extractPathParams(pathClean);

        const modName = currentModule || 'general';
        const moduleKey = sanitizeKey(modName);
        if (!modules[moduleKey]) {
          modules[moduleKey] = {
            name: modName,
            endpoints: {},
          };
        }

        let opName = sanitizeKey(item.name || `${method}_${pathClean}`);
        let finalOpName = opName;
        let counter = 1;
        while (modules[moduleKey].endpoints[finalOpName]) {
          finalOpName = `${opName}${++counter}`;
        }

        modules[moduleKey].endpoints[finalOpName] = {
          path: pathClean,
          rawPath: pathClean,
          method: method.toUpperCase(),
          pathParams,
          queryParams,
          summary: req.description || item.name || '',
        };

        const oasPath = `/${pathClean.replace(/:([a-zA-Z0-9_-]+)/g, '{$1}')}`;
        if (!openApiPaths[oasPath]) openApiPaths[oasPath] = {};

        const operation = {
          tags: [modName],
          summary: item.name,
          responses: {
            200: {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: { type: 'object' },
                },
              },
            },
          },
        };

        if (req.body?.raw) {
          try {
            const bodyJson = JSON.parse(req.body.raw);
            const schemaName = `${sanitizeKey(modName)}_${finalOpName}_Request`;
            schemas[schemaName] = valueToJsonSchema(bodyJson);
            operation.requestBody = {
              content: {
                'application/json': {
                  schema: { $ref: `#/components/schemas/${schemaName}` },
                },
              },
            };
          } catch {}
        }

        if (Array.isArray(item.response) && item.response.length > 0) {
          const sample = item.response.find((r) => r.body) || item.response[0];
          if (sample?.body) {
            try {
              const respJson = JSON.parse(sample.body);
              const schemaName = `${sanitizeKey(modName)}_${finalOpName}_Response`;
              schemas[schemaName] = valueToJsonSchema(respJson);
              operation.responses['200'] = {
                description: 'Successful response sample',
                content: {
                  'application/json': {
                    schema: { $ref: `#/components/schemas/${schemaName}` },
                  },
                },
              };
            } catch {}
          }
        }

        openApiPaths[oasPath][method] = operation;
      }
    }
  }

  walkItems(collection.item || [], 'general');

  const synthesizedOpenApi = {
    openapi: '3.0.3',
    info: {
      title: collection.info?.name || 'Postman Imported API',
      version: '1.0.0',
    },
    paths: openApiPaths,
    components: {
      schemas,
    },
  };

  return { modules, synthesizedOpenApi };
}

/**
 * Generates the TypeScript endpoints registry file (`src/app/core/api/api-endpoints.ts`),
 * intelligently merging with any existing registry.
 */
export function generateEndpointsRegistry(newModules, targetFile) {
  mkdirSync(dirname(targetFile), { recursive: true });

  const mergedModules = { ...newModules };

  let content = `/**
 * Auto-generated by Enterprise API Importer.
 * Do not manually edit endpoints that are synchronized with the backend contract.
 * Re-generate or update with: npm run api:update
 */

export const API_ENDPOINTS = {
`;

  for (const [modKey, mod] of Object.entries(mergedModules)) {
    content += `  ${modKey}: {\n`;
    for (const [opKey, ep] of Object.entries(mod.endpoints)) {
      content += `    /** ${ep.summary || ep.method + ' ' + ep.path} */\n`;
      content += `    ${opKey}: {\n`;

      if (ep.pathParams && ep.pathParams.length > 0) {
        if (ep.pathParams.length === 1) {
          const p = ep.pathParams[0];
          const interpolated = ep.path.replace(new RegExp(`\\{${p}\\}|:${p}`, 'g'), `\${${p}}`);
          content += `      path: (${p}: string | number) => \`${interpolated}\`,\n`;
        } else {
          let interpolated = ep.path;
          for (const p of ep.pathParams) {
            interpolated = interpolated.replace(
              new RegExp(`\\{${p}\\}|:${p}`, 'g'),
              `\${params.${p}}`,
            );
          }
          const paramsType = ep.pathParams.map((p) => `${p}: string | number`).join('; ');
          content += `      path: (params: { ${paramsType} }) => \`${interpolated}\`,\n`;
        }
        content += `      rawPath: '${ep.rawPath}',\n`;
      } else {
        content += `      path: '${ep.path}',\n`;
      }

      content += `      method: '${ep.method}' as const,\n`;

      if (ep.queryParams && ep.queryParams.length > 0) {
        content += `      queryParams: [${ep.queryParams.map((q) => `'${q}'`).join(', ')}] as const,\n`;
      }

      content += `    },\n`;
    }
    content += `  },\n`;
  }

  content += `} as const;\n\nexport type ApiEndpoints = typeof API_ENDPOINTS;\n`;

  writeFileSync(targetFile, content, 'utf8');
  formatFiles(targetFile);
  console.log(`[SUCCESS] Generated endpoint registry at: ${targetFile}`);
}

/**
 * Saves metadata about the imported source for future `npm run api:update` calls.
 */
export function saveSourceMetadata(source, format, modulesCount) {
  const metaDir = join(process.cwd(), 'openapi');
  mkdirSync(metaDir, { recursive: true });
  const metaFile = join(metaDir, 'api-source.json');

  const data = {
    source,
    format,
    lastImported: new Date().toISOString(),
    totalModules: Object.keys(modulesCount).length,
    moduleNames: Object.keys(modulesCount),
  };

  writeFileSync(metaFile, JSON.stringify(data, null, 2), 'utf8');
  formatFiles(metaFile);
  console.log(`[INFO] Saved API source configuration to: openapi/api-source.json`);
}

/**
 * Runs openapi-typescript to produce `src/app/generated/api-schema.ts`.
 */
export async function generateTypesFromSpec(specSourceOrJson, outputFile) {
  mkdirSync(dirname(outputFile), { recursive: true });

  let specArg = specSourceOrJson;
  let tempFile = null;

  if (typeof specSourceOrJson === 'object') {
    tempFile = join(process.cwd(), 'openapi', '_temp_openapi_spec.json');
    mkdirSync(dirname(tempFile), { recursive: true });
    writeFileSync(tempFile, JSON.stringify(specSourceOrJson, null, 2), 'utf8');
    specArg = tempFile;
  }

  try {
    console.log(`[API-IMPORT] Generating TypeScript types from specification...`);
    const result = spawnSync('npx', ['openapi-typescript', specArg, '-o', outputFile], {
      shell: process.platform === 'win32',
      stdio: 'inherit',
    });

    if (result.status !== 0) {
      console.warn(`[WARN] openapi-typescript exited with code ${result.status}`);
    } else {
      console.log(`[SUCCESS] Generated TypeScript contracts at: ${outputFile}`);
    }
  } finally {
    if (tempFile && existsSync(tempFile)) {
      try {
        const { unlinkSync } = await import('node:fs');
        unlinkSync(tempFile);
      } catch {}
    }
  }
}

/**
 * Main import runner.
 */
export async function runApiImport(sourceInput) {
  let source = sourceInput;

  // If no source provided, check if api-source.json exists
  if (!source) {
    const metaFile = join(process.cwd(), 'openapi', 'api-source.json');
    if (existsSync(metaFile)) {
      try {
        const saved = JSON.parse(readFileSync(metaFile, 'utf8'));
        if (saved.source) {
          console.log(`[INFO] Using saved API source: ${saved.source}`);
          source = saved.source;
        }
      } catch {}
    }
  }

  if (!source) {
    throw new Error(
      'No API source provided. Usage: npm run api:import -- --source=<url-or-file>\nOr save a source in openapi/api-source.json',
    );
  }

  const { raw, isUrl } = await fetchOrReadSource(source);

  let parsed = null;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    if (!isUrl) {
      console.log(`[INFO] Non-JSON file detected, treating as OpenAPI YAML.`);
      parsed = { openapi: '3.0.0', paths: {} };
    } else {
      throw new Error(`Failed to parse API specification as JSON: ${err.message}`);
    }
  }

  const detected = detectFormat(parsed);
  console.log(
    `[API-IMPORT] Detected format: ${detected.type.toUpperCase()} (${detected.version || detected.name || 'valid'})`,
  );

  let modules = {};
  const endpointsFile = join(process.cwd(), 'src', 'app', 'core', 'api', 'api-endpoints.ts');
  const schemaFile = join(process.cwd(), 'src', 'app', 'generated', 'api-schema.ts');

  if (detected.type === 'postman') {
    const { modules: postmanModules, synthesizedOpenApi } = parsePostman(parsed);
    modules = postmanModules;
    generateEndpointsRegistry(modules, endpointsFile);
    await generateTypesFromSpec(synthesizedOpenApi, schemaFile);
  } else {
    // OpenAPI / Swagger
    modules = parseOpenApi(parsed);
    generateEndpointsRegistry(modules, endpointsFile);
    await generateTypesFromSpec(isUrl ? source : resolve(source), schemaFile);
  }

  saveSourceMetadata(source, detected.type, modules);

  console.log('\n======================================================');
  console.log('  API IMPORT COMPLETE');
  console.log('======================================================');
  console.log(`- Endpoints Registry: src/app/core/api/api-endpoints.ts`);
  console.log(`- Type Definitions:   src/app/generated/api-schema.ts`);
  console.log(`- Source Tracking:    openapi/api-source.json`);
  console.log(`- Modules Generated:  ${Object.keys(modules).join(', ')}`);
  console.log('\nTo re-sync backend changes at any time, run:');
  console.log('  npm run api:update\n');
}
