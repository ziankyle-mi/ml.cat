import { test, expect } from '@playwright/test';

test.describe('Counter Draft Flow', () => {
  test('picks 5 enemy heroes, verifies suggestions, and verifies URL state restoration', async ({ page }) => {
    // 1. Open the counter page
    await page.goto('/#/counter');
    await expect(page.locator('h1')).toContainText('Counter This Draft');

    // 2. Pick 5 enemy heroes from the grid
    const heroButtons = page.locator('div[role="button"][aria-label]');
    const count = await heroButtons.count();
    expect(count).toBeGreaterThanOrEqual(5);

    const pickedNames: string[] = [];
    for (let i = 0; i < 5; i++) {
      const btn = heroButtons.nth(i);
      const name = await btn.getAttribute('aria-label');
      if (name) pickedNames.push(name);
      await btn.click();
    }

    // 3. Verify top counter answers are displayed
    const resultList = page.locator('text=Top Counter Answers');
    await expect(resultList).toBeVisible();

    const suggestionItems = page.locator('div:has-text("#1")');
    await expect(suggestionItems.first()).toBeVisible();

    // 4. Click share button to copy link
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    const shareButton = page.locator('button:has-text("Share counter draft")');
    await shareButton.click();

    // 5. Read clipboard URL
    const copiedUrl = await page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });

    expect(copiedUrl).toContain('#/counter?c=');

    // 6. Reload from the share URL
    await page.goto(copiedUrl);
    await expect(page.locator('h1')).toContainText('Counter This Draft');

    // 7. Verify all 5 picked enemy heroes are restored
    for (const name of pickedNames) {
      await expect(page.locator(`text=${name}`).first()).toBeVisible();
    }
  });
});
