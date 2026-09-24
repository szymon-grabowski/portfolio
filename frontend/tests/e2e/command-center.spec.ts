import { MODULE_COUNT, MODULE_GROUPS } from '../../src/data/modules';
import { expect, test } from './fixtures';

const modules = MODULE_GROUPS.flatMap((group) => group.modules);

test.describe('command center', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/command-center/');
  });

  test('shows every module card', async ({ page }) => {
    await expect(page.locator('.module-card')).toHaveCount(MODULE_COUNT);
    await expect(page.getByText(`${MODULE_COUNT} MODULES`)).toBeAttached();
    for (const group of MODULE_GROUPS) {
      await expect(page.getByRole('heading', { level: 2, name: group.label })).toBeVisible();
    }
  });

  test('card links match modules.ts; external ones open safely in a new tab', async ({ page }) => {
    for (const module of modules) {
      const card = page.locator('.module-card', { has: page.getByRole('heading', { name: module.title, exact: true }) });
      await expect(card).toHaveAttribute('href', module.href);
      if (module.external && module.href !== '#') {
        await expect(card).toHaveAttribute('target', '_blank');
        await expect(card).toHaveAttribute('rel', /noopener/);
      } else {
        await expect(card).not.toHaveAttribute('target', '_blank');
      }
    }
  });

  test('Repository card points to the GitHub repo', async ({ page }) => {
    const repo = page.getByRole('link', { name: /Repository/ });
    await expect(repo).toHaveAttribute('href', /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/);
  });

  test('"cd .." returns to the start screen', async ({ page }) => {
    await page.getByRole('link', { name: 'cd ..' }).click();
    await expect(page).toHaveURL('/');
  });
});
