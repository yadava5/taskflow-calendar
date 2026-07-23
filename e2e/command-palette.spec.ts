import { test, expect } from './fixtures';

const CMDK_INPUT = '[cmdk-input]';

async function openPalette(page: import('@playwright/test').Page) {
  await page.keyboard.press('ControlOrMeta+k');
  await expect(page.locator(CMDK_INPUT)).toBeVisible();
}

function storedEventTitles(page: import('@playwright/test').Page) {
  return page.evaluate(() =>
    JSON.parse(localStorage.getItem('calendar-app-events') || '[]').map(
      (e: { title: string }) => e.title
    )
  );
}

test.describe('command palette', () => {
  test('NLP quick-add creates an event that persists across reload', async ({
    page,
  }) => {
    await openPalette(page);
    await page.locator(CMDK_INPUT).fill('coffee with Alex Thursday 3pm');
    // Wait for the (async, debounced) parse to reflect the query before acting.
    const createItem = page.locator(
      '[cmdk-item][data-value="__create_event__"]'
    );
    await expect(createItem).toContainText('Coffee with Alex');
    await createItem.click();

    // Parser produced "Coffee with Alex" and it was written to the store.
    await expect
      .poll(async () => (await storedEventTitles(page)).join('|'))
      .toContain('Coffee with Alex');

    // Persists across a full reload (same localStorage-backed session).
    await page.reload();
    await expect(page.locator('.fc')).toBeVisible();
    await expect
      .poll(async () => (await storedEventTitles(page)).join('|'))
      .toContain('Coffee with Alex');

    // Clean up: delete it. The parser uses forwardDate, so "Thursday" resolves
    // to a future Thursday that can fall outside the week-scoped List view after
    // a reload — so find the event through ⌘K search (date-independent) and open
    // it directly, which navigates to its date and opens the details dialog.
    await openPalette(page);
    await page.locator(CMDK_INPUT).fill('Coffee with Alex');
    await page
      .locator('[cmdk-item][data-value^="__event_"]', {
        hasText: 'Coffee with Alex',
      })
      .first()
      .click();
    await page.getByRole('button', { name: 'Delete event' }).click();
    await expect
      .poll(async () => (await storedEventTitles(page)).join('|'))
      .not.toContain('Coffee with Alex');
  });

  test('switch-view command changes the calendar view', async ({ page }) => {
    await openPalette(page);
    await page.locator(CMDK_INPUT).fill('Day view');
    await page
      .locator('[cmdk-item]', { hasText: 'Switch to Day view' })
      .click();
    await expect(page.locator('.fc-timeGridDay-view')).toBeVisible();
  });

  test('search surfaces an existing event', async ({ page }) => {
    const title = `Searchable Meeting ${Date.now()}`;
    await page.getByRole('button', { name: 'New Event' }).click();
    await page.locator('#event-title').fill(title);
    await page.getByRole('button', { name: 'Create Event' }).click();
    await expect(page.locator('#event-title')).toBeHidden();

    await openPalette(page);
    await page.locator(CMDK_INPUT).fill('Searchable Meeting');
    await expect(
      page.locator('[cmdk-item]', { hasText: 'Searchable Meeting' }).first()
    ).toBeVisible();
  });
});
