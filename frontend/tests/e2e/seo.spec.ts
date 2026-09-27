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
