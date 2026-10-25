import { test, expect } from '@playwright/test';

const publicRoutes = [
  '/',
  '/music',
  '/music/a-z',
  '/music/albums',
  '/about',
  '/videos',
  '/visuals',
  '/visuals/lyric-videos',
  '/lyrics',
  '/fan-mail',
  '/store',
  '/studio',
  '/studio/tools/rhyme-finder',
  '/studio/tools/bar-counter',
  '/studio/tools/prompt-builder',
  '/studio/tools/lyric-formatter',
  '/studio/tools/bpm-planner',
  '/studio/tools/split-sheet',
  '/studio/tools/release-checklist',
  '/studio/tools/epk-builder',
];

async function skipWhenSupabaseIsNotConfigured(page: import('@playwright/test').Page) {
  const setupGate = page.getByRole('heading', { name: /connect attikid to supabase/i });
  if (await setupGate.isVisible().catch(() => false)) {
    test.skip(true, 'Page-level checks require Supabase environment variables.');
  }
}

test('ATTIKID boots with its descriptive SEO title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('ATTIKID Official Site | Music, Lyrics & Artist Story');
  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('body')).not.toBeEmpty();
});

test('public routes resolve through the client router', async ({ page }) => {
  await page.goto('/');
  await skipWhenSupabaseIsNotConfigured(page);

  for (const route of publicRoutes) {
    const response = await page.goto(route);
    expect(response?.status(), 'HTTP response for ' + route).toBeLessThan(400);
    await expect(page.locator('body'), 'body for ' + route).toBeVisible();
    await expect(page.locator('body'), 'non-empty page for ' + route).not.toBeEmpty();
    await expect(page).toHaveTitle(/ATTIKID/i);
  }
});

test('legacy visuals URLs redirect to videos', async ({ page }) => {
  await page.goto('/');
  await skipWhenSupabaseIsNotConfigured(page);

  await page.goto('/visuals');
  await expect(page).toHaveURL(/\/videos$/);
  await page.goto('/visuals/lyric-videos');
  await expect(page).toHaveURL(/\/videos$/);
});

test('Studio is available without Supabase and its tools are navigable', async ({ page }) => {
  await page.goto('/studio');
  await expect(page.getByRole('heading', { name: /keep it yours/i })).toBeVisible();
  await page.getByRole('link', { name: /rhyme finder/i }).click();
  await expect(page).toHaveURL(/\/studio\/tools\/rhyme-finder$/);
  await expect(page.getByRole('heading', { name: 'Rhyme Finder' })).toBeVisible();
  await page.goto('/studio/tools/release-checklist');
  await expect(page.getByText(/tasks complete/i)).toBeVisible();
});

test('unknown routes show the not-found page', async ({ page }) => {
  await page.goto('/this-route-should-not-exist');
  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('body')).not.toBeEmpty();
});
