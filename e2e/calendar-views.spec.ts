import { test, expect } from './fixtures';

const VIEW_CLASS: Record<string, string> = {
  Month: '.fc-dayGridMonth-view',
  Week: '.fc-timeGridWeek-view',
  Day: '.fc-timeGridDay-view',
  List: '.fc-listWeek-view',
};

test.describe('calendar views', () => {
  test('switches between month / week / day / list', async ({ page }) => {
    for (const view of ['Month', 'Week', 'Day', 'List'] as const) {
      await page.getByRole('button', { name: view, exact: true }).click();
      await expect(page.locator(VIEW_CLASS[view])).toBeVisible();
      await expect(
        page.getByRole('button', { name: view, exact: true })
      ).toHaveAttribute('aria-pressed', 'true');
    }
  });

  test('prev / next / today navigate the week', async ({ page }) => {
    await page.getByRole('button', { name: 'Week', exact: true }).click();
    await expect(page.locator('.fc-timeGridWeek-view')).toBeVisible();

    const firstCol = page.locator('.fc-col-header-cell[data-date]').first();
    const start = await firstCol.getAttribute('data-date');

    await page.getByRole('button', { name: 'Next period' }).click();
    await expect(firstCol).not.toHaveAttribute('data-date', start!);

    await page.getByRole('button', { name: 'Previous period' }).click();
    await expect(firstCol).toHaveAttribute('data-date', start!);

    // Navigate away, then Today returns to the week containing today.
    await page.getByRole('button', { name: 'Next period' }).click();
    await page.getByRole('button', { name: 'Today', exact: true }).click();
    const today = await page.evaluate(() => {
      const d = new Date();
      const p = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    });
    await expect(
      page.locator(`.fc-col-header-cell[data-date="${today}"]`)
    ).toBeVisible();
  });
});
