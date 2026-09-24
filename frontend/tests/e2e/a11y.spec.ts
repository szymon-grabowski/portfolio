import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';

/** Automated WCAG 2.1 A/AA checks with axe-core on every page, after the boot finishes. */
for (const path of ['/', '/command-center/']) {
  test(`accessibility ${path}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations.map(({ id, help, nodes }) => ({ id, help, targets: nodes.map((n) => n.target) }))).toEqual([]);
  });
}
