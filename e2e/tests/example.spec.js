import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  console.log(`Running ${test.info().title}`);
  await page.goto('http://localhost:8080/');
});


test.describe('Login page', () => {

  test('check login modal visible and inputs empty on startup', async ({ page }) => {

    // expect login modal to be visible
    await expect(page.getByText('Login')).toBeVisible();
    const username = page.locator('input').nth(0);
    const password = page.locator('input[type="password"]');

    await expect(username).toHaveValue("");
    await expect(password).toHaveValue("");
  });

  // TODO -> we should provide the testing db with some example user account
  test('check invalid username fails', async ({ page }) => {
    // expect login modal to be visible
    await expect(page.getByText('Login')).toBeVisible();
    const username = page.locator('input:not([type])');
    const password = page.locator('input[type="password"]');
    await username.fill("invalid_username");
    await password.fill("test");

    // press on accept button
    await page.getByText('Accept').click();

    // confirm invalid username or password pop up appears
    await expect(page.getByText('Error')).toBeVisible();
    await expect(
      page.getByText("Invalid username or password")
    ).toBeVisible();
  });

  // // TODO -> we should provide the testing db with some example user account
  test('check invalid password fails', async ({ page }) => {
    // expect login modal to be visible
    await expect(page.getByText('Login')).toBeVisible();
    const username = page.locator('input:not([type])');
    const password = page.locator('input[type="password"]');
    await username.fill("test");
    await password.fill("invalid_password");

    // press on accept button
    await page.getByText('Accept').click();

    // confirm invalid username or password pop up appears
    await expect(page.getByText('Error')).toBeVisible();
    await expect(page.getByText('Invalid username or password')).toBeVisible();
  });

  test('check empty username fails', async ({ page }) => {
    // expect login modal to be visible
    await expect(page.getByText('Login')).toBeVisible();
    const password = page.locator('input[type="password"]');
    await password.fill("test");

    // press on accept button
    await page.getByText('Accept').click();

    // confirm invalid username or password pop up appears
    await expect(page.getByText('Error')).toBeVisible();
    await expect(
      page.getByText("Username is required")
    ).toBeVisible();
  });

  test('check empty password fails', async ({ page }) => {
    // expect login modal to be visible
    await expect(page.getByText('Login')).toBeVisible();
    const username = page.locator('input:not([type])');
    await username.fill("test");

    // press on accept button
    await page.getByText('Accept').click();

    // confirm invalid username or password pop up appears
    await expect(page.getByText('Error')).toBeVisible();
    await expect(
      page.getByText("Password is required")
    ).toBeVisible();
  });

  test('Register button opens register pop-up', async ({ page }) => {
    // expect login modal to be visible
    await expect(page.getByText('Login')).toBeVisible();

    // press on accept button
    await page.getByText('Register').click();

    // confirm invalid username or password pop up appears
    await expect(page.locator('.modal_title').getByText('Register')).toBeVisible();
  });

});

test.describe("Register modal", () => {
  test('empty username fails', async ({ page }) => {
    await page.getByText('Register').click();
    // 2 first elements are input fields from login pop-ups
    const username = page.locator('input').nth(2);
    const password = page.locator('input').nth(3);
    const password_repeat = page.locator('input').nth(4);

    await password.fill("first_pass");
    await password_repeat.fill("first_pass");
    // modal is shown over the old one so take the 2nd Acceot button
    await page.getByRole('button', { name: 'Accept' }).nth(1).click();

    await expect(page.getByText('Error')).toBeVisible();
    await expect(page.getByText('Username is required.')).toBeVisible();
  });

  test('passwords do not match', async ({ page }) => {
    await page.getByText('Register').click();

    const username = page.locator('input').nth(2);
    const password = page.locator('input').nth(3);
    const password_repeat = page.locator('input').nth(4);

    await username.fill("User");
    await password.fill("first_pass");
    await password_repeat.fill("second_pass");

    await page.getByRole('button', { name: 'Accept' }).nth(1).click();

    await expect(page.getByText('Error')).toBeVisible();
    await expect(page.getByText('Passwords do not match.')).toBeVisible();
  });

  test('empty password not accepted', async ({ page }) => {
    await page.getByText('Register').click();

    const username = page.locator('input').nth(2);
    const password = page.locator('input').nth(3);
    const password_repeat = page.locator('input').nth(4);

    await username.fill("User");
    await password.fill("");
    await password_repeat.fill("");

    await page.getByRole('button', { name: 'Accept' }).nth(1).click();

    await expect(page.getByText('Error')).toBeVisible();
    await expect(page.getByText('Password is required.')).toBeVisible();
  });
})
