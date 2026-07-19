import { test, expect } from './fixtures';

async function createEvent(
  page: import('@playwright/test').Page,
  title: string
) {
  await page.getByRole('button', { name: 'New Event' }).click();
  await expect(page.locator('#event-title')).toBeVisible();
  await page.locator('#event-title').fill(title);
  await page.getByRole('button', { name: 'Create Event' }).click();
  await expect(page.locator('#event-title')).toBeHidden();
}

async function gotoList(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'List', exact: true }).click();
  await expect(page.locator('.fc-listWeek-view')).toBeVisible();
}

test.describe('calendar search & filter', () => {
  test('toolbar search narrows the calendar to matching events', async ({
    page,
  }) => {
    const stamp = Date.now();
    const alpha = `Alpha ${stamp}`;
    const beta = `Beta ${stamp}`;
    await createEvent(page, alpha);
    await createEvent(page, beta);
    await gotoList(page);
    await expect(page.locator('.fc').getByText(alpha)).toBeVisible();
    await expect(page.locator('.fc').getByText(beta)).toBeVisible();

    // Expand search and type one title — the calendar narrows to it.
    await page.getByRole('button', { name: 'Open search input' }).click();
    const search = page.getByPlaceholder('Search events...');
    await expect(search).toBeVisible();
    await search.fill('Alpha');
    await expect(page.locator('.fc').getByText(alpha)).toBeVisible();
    await expect(page.locator('.fc').getByText(beta)).toHaveCount(0);

    // Clearing the query restores the full list.
    await search.fill('');
    await expect(page.locator('.fc').getByText(beta)).toBeVisible();
  });

  test('filter popover narrows by calendar and clears', async ({ page }) => {
    const title = `Filterable ${Date.now()}`;
    await createEvent(page, title);
    await gotoList(page);
    await expect(page.locator('.fc').getByText(title)).toBeVisible();

    await page.getByRole('button', { name: 'Filter events' }).click();
    // The new event lives on the default "Personal" calendar; unchecking it
    // removes it from the grid.
    const personal = page.getByRole('checkbox', { name: 'Personal' });
    await expect(personal).toBeVisible();
    await personal.click();
    await expect(page.locator('.fc').getByText(title)).toHaveCount(0);

    // Clear filters restores it.
    await page.getByRole('button', { name: 'Clear filters' }).click();
    await expect(page.locator('.fc').getByText(title)).toBeVisible();
  });
});
