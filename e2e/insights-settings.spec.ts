import { test, expect } from './fixtures';

test.describe('insights & settings', () => {
  test('insights panel opens and closes', async ({ page }) => {
    await page.getByRole('button', { name: 'Where your week goes' }).click();
    const panel = page.getByRole('dialog');
    await expect(panel.getByText('Where your week goes')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(panel.getByText('Where your week goes')).toBeHidden();
  });

  test('theme toggle switches light / dark', async ({ page }) => {
    await page.keyboard.press('ControlOrMeta+Comma');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const isDark = () =>
      page.evaluate(() => document.documentElement.classList.contains('dark'));

    await dialog.getByRole('button', { name: 'Dark', exact: true }).click();
    await expect.poll(isDark).toBe(true);

    await dialog.getByRole('button', { name: 'Light', exact: true }).click();
    await expect.poll(isDark).toBe(false);

    // System is selectable without error.
    await dialog.getByRole('button', { name: 'System', exact: true }).click();
    await expect(
      dialog.getByRole('button', { name: 'System', exact: true })
    ).toBeVisible();
  });

  test('settings surfaces the Google Calendar connect card', async ({
    page,
  }) => {
    await page.keyboard.press('ControlOrMeta+Comma');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole('button', { name: 'Connect Google Calendar' })
    ).toBeVisible();
  });
});
