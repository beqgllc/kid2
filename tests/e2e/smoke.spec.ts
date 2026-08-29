import { test, expect } from '@playwright/test';
test('ATTIKID boots', async ({page})=>{await page.goto('/');await expect(page).toHaveTitle('ATTIKID');});
