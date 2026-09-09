import { readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, join, relative, sep } from 'node:path';

const root = process.cwd();
const sourceRoot = join(root, 'src', 'app');
const failures = [];

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    if (entry === 'node_modules' || entry === 'dist' || entry === 'coverage') {
      return [];
    }
    return statSync(fullPath).isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function importsFrom(content) {
  const matches = content.matchAll(/from\s+['"]([^'"]+)['"]/g);
  return [...matches].map((match) => match[1]);
}

function featureImportName(importPath) {
  if (importPath.startsWith('@features/')) {
    return importPath.split('/')[1] ?? null;
  }

  const featureSegment = '/features/';
  if (importPath.includes(featureSegment)) {
    return importPath.split(featureSegment)[1]?.split('/')[0] ?? null;
  }

  if (importPath.startsWith('../features/')) {
    return importPath.split('/')[2] ?? null;
  }

  return null;
}

function fail(file, message) {
  failures.push(`${relative(root, file)}: ${message}`);
}

for (const file of walk(sourceRoot).filter((path) => path.endsWith('.ts'))) {
  const rel = relative(sourceRoot, file).split(sep).join('/');
  const content = readFileSync(file, 'utf8');
  const imports = importsFrom(content);

  if (imports.some((importPath) => importPath.startsWith('@ngrx/'))) {
    fail(
      file,
      'NgRx is not installed in this starter; add it deliberately and update the project state standard before importing it',
    );
  }

  if (
    (rel.startsWith('core/') || rel.startsWith('shared/')) &&
    imports.some((importPath) => featureImportName(importPath) !== null)
  ) {
    fail(file, 'core/shared code must not import from features');
  }

  if (rel.startsWith('features/')) {
    const [, featureName] = rel.split('/');

    if (rel.includes('/store/')) {
      fail(file, 'feature state should live in state/ services for this starter template');
    }

    if (/^(actions|reducer|selectors|effects)\.ts$/.test(basename(rel))) {
      fail(
        file,
        'action/reducer/selector/effect files do not match this starter template state layout',
      );
    }

    for (const importPath of imports) {
      const importedFeature = featureImportName(importPath);
      if (importedFeature && importedFeature !== featureName) {
        fail(file, 'features must not import another feature internal implementation');
      }
    }
  }

  if (rel.includes('/pages/') && /HttpClient/.test(content)) {
    fail(file, 'page components must use data-access/facade APIs instead of HttpClient directly');
  }

  if (
    rel.startsWith('features/') &&
    /@Component\s*\(/.test(content) &&
    /\bHttpClient\b/.test(content)
  ) {
    fail(file, 'feature components must not inject HttpClient directly');
  }

  if (!rel.startsWith('core/security/') && /\b(?:localStorage|sessionStorage)\s*\./.test(content)) {
    fail(file, 'browser storage access must be encapsulated by SecureStorageService');
  }
}

if (failures.length > 0) {
  console.error('Architecture validation failed:\n');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Architecture validation passed.');
