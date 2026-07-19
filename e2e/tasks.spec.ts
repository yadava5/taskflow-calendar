import { test, expect } from './fixtures';

const SMART_INPUT = 'input[aria-label="Smart task input with highlighting"]';

async function addTask(page: import('@playwright/test').Page, title: string) {
  const input = page.locator(SMART_INPUT);
  await input.click();
  await input.fill(title);
  await input.press('Enter');
  // The store write is the source of truth for the offline app.
  await expect
    .poll(() =>
      page.evaluate(
        (t) =>
          JSON.parse(localStorage.getItem('calendar-app-tasks') || '[]').some(
            (x: { title: string }) => x.title === t
          ),
        title
      )
    )
    .toBe(true);
}

async function gotoTasksView(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Tasks', exact: true }).click();
}

test.describe('tasks', () => {
  test('create a task from the smart input', async ({ page }) => {
    const title = `Buy groceries ${Date.now()}`;
    await addTask(page, title);
    await gotoTasksView(page);
    await expect(page.getByText(title, { exact: false }).first()).toBeVisible();
  });

  test('complete a task', async ({ page }) => {
    const title = `Finish report ${Date.now()}`;
    await addTask(page, title);
    await gotoTasksView(page);
    await page
      .getByRole('checkbox', { name: `Mark "${title}" as complete` })
      .click();
    await expect
      .poll(() =>
        page.evaluate(
          (t) =>
            JSON.parse(localStorage.getItem('calendar-app-tasks') || '[]').find(
              (x: { title: string }) => x.title === t
            )?.completed,
          title
        )
      )
      .toBe(true);
  });

  test('delete a task', async ({ page }) => {
    const title = `Call plumber ${Date.now()}`;
    await addTask(page, title);
    await gotoTasksView(page);
    await page
      .getByRole('button', { name: `Task options for "${title}"` })
      .click();
    await page.getByRole('menuitem', { name: /delete/i }).click();
    // A confirm dialog may appear for destructive delete.
    const confirm = page.getByRole('button', { name: /^(Delete|Confirm|Yes)/ });
    if (await confirm.count()) await confirm.first().click();
    await expect
      .poll(() =>
        page.evaluate(
          (t) =>
            JSON.parse(localStorage.getItem('calendar-app-tasks') || '[]').some(
              (x: { title: string }) => x.title === t
            ),
          title
        )
      )
      .toBe(false);
  });
});
