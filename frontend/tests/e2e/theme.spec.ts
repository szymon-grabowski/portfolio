import { DEFAULT_THEME, THEMES } from '../../src/data/themes';
import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

/** The radio itself is visually hidden: pick a theme the way a user does, by its label. */
async function pickTheme(page: Page, name: string) {
  await page.locator('.theme-option', { hasText: name }).click();
  await expect(page.getByRole('radio', { name })).toBeChecked();
}

const other = THEMES.find((theme) => theme.id !== DEFAULT_THEME)!;

test.describe('theme picker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/command-center/');
  });

  test('opens, closes with Escape and returns focus', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'THEME' });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
  });

  test('every theme applies', async ({ page }) => {
    await page.getByRole('button', { name: 'THEME' }).click();
    for (const theme of THEMES) {
      await pickTheme(page, theme.name);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme.id);
    }
  });

  test('the chosen theme survives a reload and a page change', async ({ page }) => {
    await page.getByRole('button', { name: 'THEME' }).click();
    await pickTheme(page, other.name);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', other.id);
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', other.id);
  });

  test('"Replay boot sequence" goes back to the start screen', async ({ page }) => {
    await page.getByRole('button', { name: 'THEME' }).click();
    await page.getByRole('button', { name: 'Replay boot sequence' }).click();
    await expect(page).toHaveURL('/');
  });
});
