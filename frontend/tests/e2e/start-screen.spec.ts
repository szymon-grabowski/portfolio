import { START_COMMAND, START_TARGET } from '../../src/data/boot';
import { expect, test } from './fixtures';

test.describe('start screen', () => {
  test('boot sequence finishes and START appears', async ({ page }) => {
    await page.goto('/');
    const start = page.getByRole('link', { name: 'START' });
    await expect(start).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('[data-start]')).toHaveClass(/is-visible/);
  });

  test('a key press skips the boot sequence', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Space');
    await expect(page.locator('[data-start]')).toHaveClass(/is-visible/, { timeout: 1_000 });
  });

  test('START types the command and opens Command Center', async ({ page }) => {
    // The page leaves right after the last key, so record the prompt text where it survives navigation.
    await page.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        const input = document.querySelector('[data-prompt-input]');
        if (!input) return;
        new MutationObserver(() => sessionStorage.setItem('e2e-typed', input.textContent ?? '')).observe(input, {
          childList: true,
          characterData: true,
          subtree: true,
        });
      });
    });
    await page.goto('/');
    await page.keyboard.press('Space');
    await page.getByRole('link', { name: 'START' }).click();
    await expect(page).toHaveURL(START_TARGET);
    expect(await page.evaluate(() => sessionStorage.getItem('e2e-typed'))).toBe(START_COMMAND);
    await expect(page.getByRole('heading', { level: 1, name: 'COMMAND CENTER' })).toBeVisible();
  });

  test('boot sequence plays only once per session', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Space');
    await page.reload();
    // Already booted: START is shown at once, without the animation.
    await expect(page.locator('[data-start]')).toHaveClass(/is-visible/, { timeout: 500 });
  });

  test('works with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('[data-start]')).toHaveClass(/is-visible/, { timeout: 500 });
  });
});
