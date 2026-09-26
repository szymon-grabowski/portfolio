import { CERTIFICATIONS, EXPERIENCE, PROFILE, PROFILE_LINKS, PROJECTS, SKILLS } from '../../src/data/profile';
import { PROJECT_LINKS } from '../../src/data/project';
import { expect, test } from './fixtures';

test.describe('2.1 about me', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about/');
  });

  test('shows the profile and every link from profile.ts', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: 'ABOUT ME' })).toBeVisible();
    await expect(page.getByText(PROFILE.name, { exact: true })).toBeVisible();
    for (const link of PROFILE_LINKS) {
      const card = page.locator('.link-card', { hasText: link.title });
      await expect(card).toHaveAttribute('href', link.href);
      if (link.external) await expect(card).toHaveAttribute('rel', /noopener/);
    }
    await expect(page.getByRole('link', { name: /Email/ })).toHaveAttribute('href', `mailto:${PROFILE.email}`);
  });

  test('experience, skills and education from profile.ts are all listed', async ({ page }) => {
    const jobs = page.locator('.job');
    await expect(jobs).toHaveCount(EXPERIENCE.length);
    for (const [i, job] of EXPERIENCE.entries()) {
      await expect(jobs.nth(i).locator('.job__title')).toContainText(job.role);
      await expect(jobs.nth(i).locator('.job__period')).toHaveText(job.period);
    }
    await expect(page.locator('.skills__row')).toHaveCount(SKILLS.length);
    await expect(page.getByRole('heading', { name: 'EDUCATION / LANGUAGES' })).toBeAttached();
  });

  test('CV is a disabled card until public/cv.pdf exists, then opens in a new tab', async ({ page }) => {
    const cv = page.locator('.link-card', { hasText: 'CV' });
    const href = await cv.getAttribute('href');
    if (href === null) {
      await expect(cv).toHaveAttribute('aria-disabled', 'true');
    } else {
      await expect(cv).toHaveAttribute('href', '/cv.pdf');
      await expect(cv).toHaveAttribute('target', '_blank');
    }
  });

  test('copy button puts the email address on the clipboard', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'clipboard permissions are Chromium-only in Playwright');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const button = page.getByRole('button', { name: 'Copy email address' });
    await button.click();
    await expect(button).toHaveClass(/is-copied/);
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(PROFILE.email);
  });

  test('certifications and other projects follow profile.ts', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'CERTIFICATIONS' })).toHaveCount(CERTIFICATIONS.length ? 1 : 0);
    for (const cert of CERTIFICATIONS) await expect(page.getByText(cert.name)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'OTHER PROJECTS' })).toHaveCount(PROJECTS.length ? 1 : 0);
  });

  test('"cd .." returns to the Command Center', async ({ page }) => {
    await page.getByRole('link', { name: 'cd ..' }).click();
    await expect(page).toHaveURL('/command-center/');
  });
});

test.describe('2.2 about this project', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/project/');
  });

  test('shows goal, architecture, stack and every link from project.ts', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: 'ABOUT THIS PROJECT' })).toBeVisible();
    for (const label of ['GOAL', 'STACK', 'ARCHITECTURE', 'EXPLORE']) {
      await expect(page.getByRole('heading', { level: 2, name: label })).toBeVisible();
    }
    for (const link of PROJECT_LINKS) {
      const card = page.locator('.link-card', { hasText: link.title });
      await expect(card).toHaveAttribute('href', link.href);
      await expect(card).toHaveAttribute('target', '_blank');
    }
  });

  test('"cd .." returns to the Command Center', async ({ page }) => {
    await page.getByRole('link', { name: 'cd ..' }).click();
    await expect(page).toHaveURL('/command-center/');
  });
});

test('Command Center profile cards open 2.1 and 2.2', async ({ page }) => {
  await page.goto('/command-center/');
  await page.getByRole('link', { name: /About me/ }).click();
  await expect(page).toHaveURL('/about/');
  await page.goto('/command-center/');
  await page.getByRole('link', { name: /About this project/ }).click();
  await expect(page).toHaveURL('/project/');
});
