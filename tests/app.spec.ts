import { test, expect } from '@playwright/test';

test('homepage has title and links', async ({ page }) => {
  await page.goto('/');
  
  // Assert that the page title contains the project name
  await expect(page).toHaveTitle(/flashcard-from-document/);
  
  // Assert that the welcome message is visible
  const welcomeMessage = page.locator('h1');
  await expect(welcomeMessage).toBeVisible();
  await expect(welcomeMessage).toContainText('Welcome to Your Vue.js App');
});