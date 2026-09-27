import { expect, test } from './fixtures';

const PAGES = ['/', '/command-center/', '/about/', '/project/'];

test('robots.txt allows crawling, hides the CV and points to the sitemap', async ({ request }) => {
  const res = await request.get('/robots.txt');
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toMatch(/^User-agent: \*$/m);
  expect(body).toMatch(/^Disallow: \/cv\.pdf$/m);
  expect(body).toMatch(/^Sitemap: https:\/\/szymongrabowski\.dev\/sitemap-index\.xml$/m);
});

test('sitemap lists every page on the canonical origin, and nothing else', async ({ request }) => {
  const index = await (await request.get('/sitemap-index.xml')).text();
  expect(index).toContain('https://szymongrabowski.dev/sitemap-0.xml');
  const urls = [...(await (await request.get('/sitemap-0.xml')).text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  expect(urls.sort()).toEqual(PAGES.map((p) => `https://szymongrabowski.dev${p}`).sort());
});

test.describe('404', () => {
  // The browser logs the 404 of the page itself; that is the point of this test.
  test.use({ allowedConsole: [/status of 404/] });

  test('unknown paths get a real 404 page', async ({ page }) => {
    const res = await page.goto('/no-such-page');
    expect(res?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1, name: 'SYSTEM DOWN' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'REBOOT' })).toHaveAttribute('href', '/');
    await expect(page.locator('[data-path]')).toHaveText('/no-such-page');
    await page.getByRole('link', { name: 'cd /command-center' }).click();
    await expect(page).toHaveURL('/command-center/');
  });
});

test.describe('link previews (Open Graph)', () => {
  for (const path of PAGES) {
    test(`${path} has a full card on the canonical origin`, async ({ page }) => {
      await page.goto(path);
      const meta = (sel: string) => page.locator(sel).getAttribute('content');
      const url = `https://szymongrabowski.dev${path}`;
      expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toBe(url);
      expect(await meta('meta[property="og:url"]')).toBe(url);
      expect(await meta('meta[property="og:title"]')).toBe(await page.title());
      expect(await meta('meta[property="og:description"]')).toBe(await meta('meta[name="description"]'));
      expect(await meta('meta[property="og:image"]')).toBe('https://szymongrabowski.dev/og.png');
      expect(await meta('meta[name="twitter:card"]')).toBe('summary_large_image');
    });
  }

  test('og.png and the iOS icon are served as PNG', async ({ request }) => {
    for (const file of ['/og.png', '/apple-touch-icon.png']) {
      const res = await request.get(file);
      expect(res.status(), file).toBe(200);
      expect(res.headers()['content-type'], file).toBe('image/png');
    }
  });

  test('the 404 page and the OG template stay out of search results', async ({ page }) => {
    for (const path of ['/404.html', '/og-image/']) {
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]'), path).toHaveAttribute('content', 'noindex');
      await expect(page.locator('link[rel="canonical"]'), path).toHaveCount(0);
    }
  });
});
