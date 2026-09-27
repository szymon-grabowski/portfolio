import { MODULE_GROUPS } from '../../src/data/modules';
import { STATUS_TEXT } from '../../src/data/status';
import { THEME_IDS, THEME_STORAGE_KEY } from '../../src/data/themes';
import { ALL_CHECKS, expect, mockStatus, test } from './fixtures';

const live = MODULE_GROUPS.flatMap((g) => g.modules).filter((m) => m.check);
const card = (page: import('@playwright/test').Page, title: string) =>
  page.locator('.module-card', { has: page.getByRole('heading', { name: title, exact: true }) });

test('header shows the role next to the name', async ({ page }) => {
  await page.goto('/command-center/');
  await expect(page.locator('.bar__role')).toHaveText('DEVOPS ENGINEER');
});

test('all checks OK: green cards with their status, header operational', async ({ page }) => {
  await page.goto('/command-center/');
  for (const m of live) {
    await expect(card(page, m.title)).toHaveAttribute('data-state', 'ok');
    await expect(card(page, m.title).locator('[data-status-text]')).toHaveText(m.status);
  }
  await expect(page.locator('[data-status-summary]')).toHaveAttribute('data-state', 'ok');
  await expect(page.locator('[data-status-summary]')).toContainText(STATUS_TEXT.ok);
});

test('a failing check turns its card red and the header counts it', async ({ page }) => {
  await page.unrouteAll();
  await mockStatus(page, Object.fromEntries(ALL_CHECKS.map((c) => [c, c !== 'cicd'])));
  await page.goto('/command-center/');
  const ci = live.find((m) => m.check === 'cicd')!;
  await expect(card(page, ci.title)).toHaveAttribute('data-state', 'fail');
  await expect(card(page, ci.title).locator('[data-status-text]')).toHaveText(ci.failStatus!);
  await expect(page.locator('[data-status-summary]')).toHaveAttribute('data-state', 'fail');
  await expect(page.locator('[data-status-summary]')).toContainText(STATUS_TEXT.failing(1, ALL_CHECKS.length));
});

test('no data is shown as unknown, never as OK', async ({ page }) => {
  await page.unrouteAll();
  await mockStatus(page, {});
  await page.goto('/command-center/');
  for (const m of live) await expect(card(page, m.title)).toHaveAttribute('data-state', 'unknown');
  await expect(page.locator('[data-status-summary]')).toContainText(STATUS_TEXT.unavailable);
});

// Fixed status colours (themes.css): the same green / red / grey in every theme.
const COLORS = { ok: 'rgb(74, 222, 128)', fail: 'rgb(248, 113, 113)', unknown: 'rgb(156, 163, 175)' };

for (const theme of THEME_IDS) {
  test(`status colours do not depend on the theme: ${theme}`, async ({ page }) => {
    await page.addInitScript(([key, id]) => localStorage.setItem(key, id), [THEME_STORAGE_KEY, theme]);
    await page.unrouteAll();
    // cicd failing, loki without data, the rest OK
    await mockStatus(page, Object.fromEntries(ALL_CHECKS.filter((c) => c !== 'loki').map((c) => [c, c !== 'cicd'])));
    await page.goto('/command-center/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    const led = (check: string) => page.locator(`[data-check="${check}"] .module-card__led`);
    await expect(led('grafana')).toHaveCSS('background-color', COLORS.ok);
    await expect(led('cicd')).toHaveCSS('background-color', COLORS.fail);
    await expect(led('loki')).toHaveCSS('background-color', COLORS.unknown);
    await expect(page.locator('[data-status-summary] .bar__led')).toHaveCSS('background-color', COLORS.fail);
  });
}

test.describe('boot log module count', () => {
  const count = (page: import('@playwright/test').Page) => page.locator('[data-modules] [data-status]');
  // Skip the animation: the count must still appear.
  test.beforeEach(async ({ page }) => page.emulateMedia({ reducedMotion: 'reduce' }));

  test('all checks OK: green N/N', async ({ page }) => {
    await page.goto('/');
    await expect(count(page)).toHaveText(`[${ALL_CHECKS.length}/${ALL_CHECKS.length}]`);
    await expect(count(page)).toHaveCSS('color', COLORS.ok);
  });

  test('one check failing: yellow (N-1)/N', async ({ page }) => {
    await page.unrouteAll();
    await mockStatus(page, Object.fromEntries(ALL_CHECKS.map((c) => [c, c !== 'loki'])));
    await page.goto('/');
    await expect(count(page)).toHaveText(`[${ALL_CHECKS.length - 1}/${ALL_CHECKS.length}]`);
    await expect(count(page)).toHaveCSS('color', 'rgb(250, 204, 21)');
  });

  test('checks without data count as not working', async ({ page }) => {
    await page.unrouteAll();
    await mockStatus(page, {});
    await page.goto('/');
    await expect(count(page)).toHaveText(`[0/${ALL_CHECKS.length}]`);
  });
});
