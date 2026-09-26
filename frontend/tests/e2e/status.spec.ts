import { MODULE_GROUPS } from '../../src/data/modules';
import { STATUS_TEXT } from '../../src/data/status';
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
