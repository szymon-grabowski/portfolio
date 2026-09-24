import { test as base, expect } from '@playwright/test';

/**
 * Every test fails if the page logs a console error or throws an uncaught exception:
 * a broken script must never pass as long as the tested element happens to render.
 */
export const test = base.extend<{ pageErrors: string[] }>({
  pageErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
      });
      page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
      await use(errors);
      expect(errors, 'no console errors or uncaught exceptions').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
