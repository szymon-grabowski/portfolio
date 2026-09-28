import { expect, test } from './fixtures';

const PAGES = ['/', '/command-center/', '/about/', '/project/'];

for (const path of PAGES) {
  test.describe(`layout ${path}`, () => {
    test('no horizontal scroll', async ({ page }) => {
      await page.goto(path);
      // Compare with the viewport the test set, not innerWidth: mobile browsers widen innerWidth
      // to fit an overflowing page (so the overflow reads 0), and headless Firefox reports a
      // fixed 1366px screen whatever the window size.
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(page.viewportSize()!.width);
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

// Pages built to fit the monitor screen without scrolling: adding text must not push the last
// panel onto the screen's bezel (it happened once to EXPLORE on /project/, unnoticed by the other tests).
test.describe('content fits the monitor screen', () => {
  test.skip(({ isMobile }) => isMobile, 'the monitor frame is desktop only');
  test.use({ viewport: { width: 1440, height: 900 } });
  for (const path of ['/command-center/', '/project/']) {
    test(path, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('body')).toHaveClass(/framed/);
      const gap = await page.evaluate(() => {
        const scale = document.querySelector('[data-monitor-rig]')!.getBoundingClientRect().width
          / (document.querySelector('[data-monitor-rig]') as HTMLElement).offsetWidth;
        const screen = document.querySelector('.screen')!.getBoundingClientRect();
        const last = Math.max(...[...document.querySelectorAll('.cc > *, .cc .cc-group')].map((el) => el.getBoundingClientRect().bottom));
        return (screen.bottom - last) / scale;
      });
      // The inner frame of the screen sits about 16px above its edge.
      expect(gap).toBeGreaterThanOrEqual(20);
    });
  }
});

// Narrowest common phones: header (name, role, LED, theme) and boot log must fit.
test.describe('narrow phone (360px)', () => {
  test.use({ viewport: { width: 360, height: 780 } });
  for (const path of PAGES) {
    test(`no horizontal scroll ${path}`, async ({ page }) => {
      await page.goto(path);
      // Compare with the viewport the test set, not innerWidth: mobile browsers widen innerWidth
      // to fit an overflowing page (so the overflow reads 0), and headless Firefox reports a
      // fixed 1366px screen whatever the window size.
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(page.viewportSize()!.width);
    });
  }
});

// Without the monitor the page scrolls; body carries the page background, so it must cover
// the whole page (otherwise the black html background shows below the first screen).
test.describe('full-screen background', () => {
  test.use({ viewport: { width: 412, height: 800 } });
  for (const path of PAGES) {
    test(`body covers the whole page ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('body')).not.toHaveClass(/framed/);
      const { bodyH, pageH } = await page.evaluate(() => ({
        bodyH: document.body.getBoundingClientRect().height,
        pageH: document.documentElement.scrollHeight,
      }));
      expect(bodyH).toBeGreaterThanOrEqual(pageH - 1);
    });
  }
});
