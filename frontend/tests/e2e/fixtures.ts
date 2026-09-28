import { test as base, expect, type Page } from '@playwright/test';
import type { CheckName } from '../../src/data/status';

/** Mocked /api/status: the page reads it instead of the live /api/status. */
export const STATUS_MOCK_URL = '/__status-mock';

export const ALL_CHECKS: CheckName[] = ['site', 'repository', 'cicd', 'argocd', 'kubernetes', 'grafana', 'prometheus', 'loki'];

/** Prometheus instant-query body with one site_status series per check (true = OK). */
export function statusBody(checks: Partial<Record<CheckName, boolean>>) {
  return {
    status: 'success',
    data: {
      resultType: 'vector',
      result: Object.entries(checks).map(([check, ok]) => ({ metric: { __name__: 'site_status', check }, value: [0, ok ? '1' : '0'] })),
    },
  };
}

/** An empty object = Prometheus has no site_status series (e.g. rules not evaluated yet). */
export async function mockStatus(page: Page, checks: Partial<Record<CheckName, boolean>>) {
  await page.route(`**${STATUS_MOCK_URL}`, (route) => route.fulfill({ json: statusBody(checks) }));
}

/**
 * Every test fails if the page logs a console error or throws an uncaught exception:
 * a broken script must never pass as long as the tested element happens to render.
 * Status is mocked as all OK unless a test sets its own route first.
 */
export const test = base.extend<{ pageErrors: string[]; allowedConsole: RegExp[] }>({
  /** Console messages a test expects (e.g. the 404 of a deliberately missing page); everything else still fails. */
  allowedConsole: [[], { option: true }],
  page: async ({ page }, use) => {
    await page.addInitScript((url) => { window.__STATUS_URL__ = url; }, STATUS_MOCK_URL);
    await mockStatus(page, Object.fromEntries(ALL_CHECKS.map((c) => [c, true])));
    await use(page);
  },
  pageErrors: [
    async ({ page, allowedConsole }, use) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error' && !allowedConsole.some((re) => re.test(msg.text()))) errors.push(`console: ${msg.text()}`);
      });
      page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
      await use(errors);
      expect(errors, 'no console errors or uncaught exceptions').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
