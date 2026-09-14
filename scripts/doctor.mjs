import { execSync } from 'node:child_process';

console.log('\x1b[35m%s\x1b[0m', 'DOCTOR: Running Enterprise Frontend Doctor Health Check...\n');

let allPassed = true;

function check(title, fn) {
  process.stdout.write(`Checking ${title}... `);
  try {
    fn();
    console.log('\x1b[32m%s\x1b[0m', 'PASSED');
  } catch (err) {
    allPassed = false;
    console.log('\x1b[31m%s\x1b[0m', 'FAILED');
    console.error('  Error:', err.message || err);
  }
}

check('Node.js version (>=20.x)', () => {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0], 10);
  if (major < 20) throw new Error(`Node ${version} is below recommended >=20.x`);
});

check('TypeScript compilation (tsconfig.app.json)', () => {
  execSync('npx tsc --noEmit -p tsconfig.app.json', { stdio: 'pipe' });
});

check('TypeScript compilation (tsconfig.spec.json)', () => {
  execSync('npx tsc --noEmit -p tsconfig.spec.json', { stdio: 'pipe' });
});

check('Architecture boundary integrity', () => {
  execSync('node scripts/architecture-validate.mjs', { stdio: 'pipe' });
});

check('Prettier formatting standard', () => {
  execSync('npx prettier . --check', { stdio: 'pipe' });
});

console.log('');
if (allPassed) {
  console.log(
    '\x1b[32m%s\x1b[0m',
    '[SUCCESS] All health checks passed! Codebase is production-ready.',
  );
} else {
  console.log('\x1b[31m%s\x1b[0m', '[WARN] Some checks failed. Please address the errors above.');
  process.exit(1);
}
