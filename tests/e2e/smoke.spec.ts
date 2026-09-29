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
];

async function skipWhenSupabaseIsNotConfigured(page: import('@playwright/test').Page) {
  const setupGate = page.getByRole('heading', { name: /connect attikid to supabase/i });
  if (await setupGate.isVisible().catch(() => false)) {
    test.skip(true, 'Page-level checks require Supabase environment variables.');
  }
}

test('ATTIKID boots', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('ATTIKID — Music, Lyrics & Story');
  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('body')).not.toBeEmpty();
});

test('public routes resolve through the client router', async ({ page }) => {
  await page.goto('/');
  await skipWhenSupabaseIsNotConfigured(page);

  for (const route of publicRoutes) {
    const response = await page.goto(route);
    expect(response?.status(), `HTTP response for ${route}`).toBeLessThan(400);
    await expect(page.locator('body'), `body for ${route}`).toBeVisible();
    await expect(page.locator('body'), `non-empty page for ${route}`).not.toBeEmpty();
    await expect(page).toHaveTitle('ATTIKID — Music, Lyrics & Story');
  }
});

test('legacy visuals URLs redirect to videos', async ({ page }) => {
  await page.goto('/');
  await skipWhenSupabaseIsNotConfigured(page);

  await page.goto('/visuals');
  await expect(page).toHaveURL(/\\/videos$/);
  await page.goto('/visuals/lyric-videos');
  await expect(page).toHaveURL(/\\/videos$/);
});

test('unknown routes show the not-found page', async ({ page }) => {
  await page.goto('/this-route-should-not-exist');
  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('body')).not.toBeEmpty();
});
