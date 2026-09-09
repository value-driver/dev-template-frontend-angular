import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('the sign-in page has no automatically detectable WCAG A/AA violations', async ({ page }) => {
  await page.goto('/auth/login');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  expect(results.violations).toEqual([]);
});
