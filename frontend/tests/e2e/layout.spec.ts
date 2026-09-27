import { expect, test } from './fixtures';

const PAGES = ['/', '/command-center/', '/about/', '/project/'];

for (const path of PAGES) {
  test.describe(`layout ${path}`, () => {
    test('no horizontal scroll', async ({ page }) => {
      await page.goto(path);
      // Mobile browsers widen innerWidth to fit an overflowing page, so compare with the screen too.
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - Math.min(window.innerWidth, window.screen.width),
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });

    test('black page background (no white flash around the screen)', async ({ page }) => {
      await page.goto(path);
      const bg = await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);
      expect(bg).toBe('rgb(0, 0, 0)');
    });
  });
}

test.describe('monitor frame', () => {
  test.skip(({ isMobile }) => isMobile, 'viewport sizes are set by the test itself');

  const cases = [
    { name: 'full HD', width: 1920, height: 1080, framed: true },
    // Browser zoomed out to 50%: the monitor must stay (regression test).
    { name: 'zoomed out 50%', width: 3840, height: 2160, framed: true },
    { name: 'portrait monitor', width: 1080, height: 1920, framed: false },
    { name: 'small window', width: 700, height: 500, framed: false },
  ];

  for (const { name, width, height, framed } of cases) {
    test(`${name} (${width}x${height}) → ${framed ? 'framed' : 'full screen'}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/command-center/');
      const body = expect(page.locator('body'));
      await (framed ? body.toHaveClass(/framed/) : body.not.toHaveClass(/framed/));
      await expect(page.locator('.module-card').first()).toBeInViewport();
    });
  }
});

// Narrowest common phones: header (name, role, LED, theme) and boot log must fit.
test.describe('narrow phone (360px)', () => {
  test.use({ viewport: { width: 360, height: 780 } });
  for (const path of PAGES) {
    test(`no horizontal scroll ${path}`, async ({ page }) => {
      await page.goto(path);
      // Mobile browsers widen innerWidth to fit an overflowing page, so compare with the screen too.
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - Math.min(window.innerWidth, window.screen.width),
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});
