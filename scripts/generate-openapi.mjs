import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const rawSpec = process.env.OPENAPI_SPEC ?? 'openapi/openapi.yaml';
const isUrl = /^https?:\/\//i.test(rawSpec);
const spec = isUrl ? rawSpec : resolve(rawSpec);
const output = resolve('src/app/generated/api-schema.ts');

if (!isUrl && !existsSync(spec)) {
  console.error(
    `OpenAPI specification not found: ${spec}\nSet OPENAPI_SPEC to a local file, a remote URL, or add openapi/openapi.yaml.`,
  );
  process.exit(1);
}

mkdirSync(dirname(output), { recursive: true });
const result = spawnSync('npx', ['openapi-typescript', spec, '-o', output], {
  shell: process.platform === 'win32',
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
