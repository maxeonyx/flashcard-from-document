import { test, expect } from '@playwright/test';

test('homepage has title and basic components', async ({ page }) => {
  await page.goto('/');
  
  // Assert that the page title contains the project name
  await expect(page).toHaveTitle('Flashcard From Document');
  
  // Assert that the main title is visible
  const mainTitle = page.locator('h1');
  await expect(mainTitle).toBeVisible();
  await expect(mainTitle).toContainText('Flashcard From Document');
  
  // Either the API key input or document uploader should be visible
  const apiKeyInput = page.locator('.api-key-input');
  await expect(apiKeyInput).toBeVisible();
});

test('API key input form can be submitted', async ({ page }) => {
  await page.goto('/');
  
  // Check that API key component exists
  const apiKeySection = page.locator('.api-key-input');
  await expect(apiKeySection).toBeVisible();
  
  // Enter an API key
  const testKey = 'test-api-key-123';
  await page.locator('.api-key-input input').fill(testKey);
  await page.locator('.api-key-input button').click();
  
  // Verify the key status changes
  await expect(page.locator('.key-status')).toBeVisible();
});

test('page contains footer with version info', async ({ page }) => {
  await page.goto('/');
  
  // Footer should be visible
  const footer = page.locator('footer');
  await expect(footer).toBeVisible();
  
  // Footer should contain version text
  await expect(footer).toContainText('Version');
  await expect(footer).toContainText('Powered by Anthropic\'s Claude API');
});