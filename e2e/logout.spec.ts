import { test, expect } from './fixtures';

test.describe('logout', () => {
  test('⌘Q logs out and returns to the landing', async ({ page }) => {
    // The logout shortcut asks for confirmation via a native dialog.
    page.on('dialog', (d) => d.accept());
    await page.keyboard.press('ControlOrMeta+q');
    await expect(page).toHaveURL(/\/welcome$/);
    // Session cleared.
    const authed = await page.evaluate(() => {
      const raw = localStorage.getItem('auth-store');
      return raw ? JSON.parse(raw).state.isAuthenticated : false;
    });
    expect(authed).toBe(false);
  });
});
