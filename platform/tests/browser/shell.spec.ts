import { expect, test } from '@playwright/test';

test('built editor and player load directly and navigate without runtime errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  for (const entry of ['index.html', 'player.html']) {
    await page.goto(`/${entry}`);
    await expect(page.getByText('Chưa mở project', { exact: true }).first()).toBeVisible();
    await expect(page.locator('[data-workspace-state="empty"]')).toBeVisible();
    await page.reload();
    await expect(page.locator('main')).toBeVisible();
  }
  await expect(page.getByRole('region', { name: 'Thuộc tính' })).toHaveCount(0);
  await page.getByRole('link', { name: 'Editor', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Thuộc tính' })).toBeVisible();
  await page.getByRole('link', { name: 'Player', exact: true }).click();
  await expect(page).toHaveTitle('learn-spine · Player');
  expect(errors).toEqual([]);
});

test('shell remains readable at narrow widths and exposes keyboard navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('region', { name: 'Vùng làm việc' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'learn-spine, về Editor' })).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Player', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveTitle('learn-spine · Player');
});
