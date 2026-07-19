import { test, expect } from './fixtures';

/** At phone widths (<768px) the week grid folds to the agenda/list view. */
test.describe('mobile 375px', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('week folds to the agenda/list view', async ({ page }) => {
    // The app loads on the Week view, which on a narrow viewport renders as
    // the readable agenda (listWeek) instead of seven cramped columns.
    await expect(page.locator('.fc-listWeek-view')).toBeVisible();
    // A day/agenda row surface is present rather than a 7-col time grid.
    await expect(page.locator('.fc-timeGridWeek-view')).toHaveCount(0);
  });
});
