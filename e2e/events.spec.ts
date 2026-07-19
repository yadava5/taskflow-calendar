import { test, expect } from './fixtures';

/** Open the create-event dialog, set a title, submit. */
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

/** List view lists every event in the week as plain rows — the reliable surface. */
async function gotoList(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'List', exact: true }).click();
  await expect(page.locator('.fc-listWeek-view')).toBeVisible();
}

test.describe('events', () => {
  test('create an event', async ({ page }) => {
    const title = `E2E Event ${Date.now()}`;
    await createEvent(page, title);
    await gotoList(page);
    await expect(page.locator('.fc').getByText(title)).toBeVisible();
  });

  test('edit an event', async ({ page }) => {
    const title = `E2E Edit ${Date.now()}`;
    const updated = `${title} UPDATED`;
    await createEvent(page, title);
    await gotoList(page);

    await page.locator('.fc').getByText(title).first().click();
    await page.getByRole('button', { name: 'Edit event' }).click();
    await expect(page.locator('#event-title')).toBeVisible();
    await page.locator('#event-title').fill(updated);
    await page
      .getByRole('button', { name: /^(Save|Update|Save changes)$/ })
      .click();
    await expect(page.locator('#event-title')).toBeHidden();

    await expect(page.locator('.fc').getByText(updated)).toBeVisible();
  });

  test('delete an event', async ({ page }) => {
    const title = `E2E Delete ${Date.now()}`;
    await createEvent(page, title);
    await gotoList(page);
    await expect(page.locator('.fc').getByText(title)).toBeVisible();

    await page.locator('.fc').getByText(title).first().click();
    await page.getByRole('button', { name: 'Delete event' }).click();
    // Non-recurring delete is immediate; the row disappears.
    await expect(page.locator('.fc').getByText(title)).toHaveCount(0);
  });
});
