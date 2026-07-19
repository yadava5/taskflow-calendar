import { test, expect } from './fixtures';

/**
 * The Event dialog's "Task" tab used to be a "coming soon" placeholder. It now
 * creates a real task via the same path the ⌘K palette uses.
 */
function storedTasks(page: import('@playwright/test').Page) {
  return page.evaluate(() =>
    JSON.parse(localStorage.getItem('calendar-app-tasks') || '[]')
  );
}

test.describe('event dialog — Task tab', () => {
  test('creates a real task (title + priority) that persists', async ({
    page,
  }) => {
    const title = `Tab Task ${Date.now()}`;

    await page.getByRole('button', { name: 'New Event' }).click();
    // Switch to the Task tab (TabsTrigger aria-label="Create task").
    await page.getByRole('tab', { name: 'Create task' }).click();

    const input = page.locator('#task-title');
    await expect(input).toBeVisible();
    await input.fill(title);

    // Exercise the priority select.
    await page.getByRole('combobox', { name: 'Task priority' }).click();
    await page.getByRole('option', { name: 'High priority' }).click();

    await page.getByRole('button', { name: 'Add Task' }).click();
    // Submitting closes the dialog.
    await expect(input).toBeHidden();

    // The task was really created (offline store is the source of truth).
    await expect
      .poll(async () => {
        const tasks = (await storedTasks(page)) as Array<{
          title: string;
          priority?: string;
        }>;
        const t = tasks.find((x) => x.title === title);
        return t ? t.priority : undefined;
      })
      .toBe('high');

    // And it shows up in the Tasks view.
    await page.getByRole('button', { name: 'Tasks', exact: true }).click();
    await expect(page.getByText(title, { exact: false }).first()).toBeVisible();
  });
});
