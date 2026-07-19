import { test, expect } from './fixtures';

/**
 * Delete-account flow. The authenticated fixture is a DISPOSABLE offline session
 * (e2e@example.com) — never the shared demo john@example.com — and offline mode
 * means no real database is touched. This exercises the typed-confirmation gate,
 * the deletion call, session clearing, and the redirect to the landing page.
 */
test.describe('account deletion', () => {
  test('typed-confirm delete clears the session and returns to landing', async ({
    page,
  }) => {
    await page.keyboard.press('ControlOrMeta+Comma');
    const settings = page.getByRole('dialog');
    await expect(settings).toBeVisible();

    // Data Management → Delete.
    await settings.getByRole('button', { name: 'Delete', exact: true }).click();

    const confirm = page.getByRole('alertdialog');
    await expect(confirm).toBeVisible();
    const action = confirm.getByRole('button', { name: 'Delete account' });
    // Gated until the user types DELETE.
    await expect(action).toBeDisabled();
    await confirm.getByLabel('Type DELETE to confirm').fill('DELETE');
    await expect(action).toBeEnabled();
    await action.click();

    // Redirected to the landing page, session cleared.
    await expect(page).toHaveURL(/\/welcome$/);
    const authed = await page.evaluate(() => {
      const raw = localStorage.getItem('auth-store');
      return raw ? JSON.parse(raw).state.isAuthenticated : false;
    });
    expect(authed).toBe(false);
  });
});
