import { publicTest as test, expect } from './fixtures';

/**
 * The Signup "Create account" button used to be a dead no-op (the form only
 * called preventDefault). It is now wired to real registration and gated by
 * client-side validation. This public test drives that validation gating —
 * no backend required.
 */
test.describe('signup form', () => {
  test('Create account is gated until the form is valid', async ({ page }) => {
    await page.goto('/signup');

    const submit = page.getByRole('button', { name: /^Create account$/ });
    await expect(submit).toBeDisabled();

    await page.locator('#name').fill('Jamie Rivera');
    await page.locator('#email').fill(`jamie${Date.now()}@example.com`);

    // Weak password keeps it disabled.
    await page.locator('#password').fill('weak');
    await page.locator('#confirmPassword').fill('weak');
    await expect(submit).toBeDisabled();

    // Strong password but mismatched confirm surfaces an inline message.
    await page.locator('#password').fill('StrongPass1');
    await page.locator('#confirmPassword').fill('Mismatch1');
    await expect(page.getByText('Passwords do not match')).toBeVisible();
    await expect(submit).toBeDisabled();

    // Matching, strong password enables submission.
    await page.locator('#confirmPassword').fill('StrongPass1');
    await expect(submit).toBeEnabled();
  });
});
