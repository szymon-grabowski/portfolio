import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';

/** Automated WCAG 2.1 A/AA checks with axe-core on every page, after the boot finishes. */
for (const path of ['/', '/command-center/', '/about/', '/project/', '/404.html']) {
  test(`accessibility ${path}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations.map(({ id, help, nodes }) => ({ id, help, targets: nodes.map((n) => n.target) }))).toEqual([]);
  });
}

/** Every page starts its heading outline with its own <h1> (nothing from the header comes first). */
for (const path of ['/', '/command-center/', '/about/', '/project/', '/404.html']) {
  test(`first heading is the h1: ${path}`, async ({ page }) => {
    await page.goto(path);
    const first = await page.locator('h1, h2, h3, h4, h5, h6').first().evaluate((el) => el.tagName);
    expect(first).toBe('H1');
  });
}
