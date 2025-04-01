import { test, expect } from '@playwright/test';

// IMPORTANT: App should respond very quickly, so all waitForSelector calls should have a 
// short timeout (100ms is enough for proper reactivity). Longer timeouts hide performance issues.
// If something truly needs more time, it should be explicitly justified with a comment.
const SHORT_TIMEOUT = 100; // ms - for checking reactivity
const NORMAL_TIMEOUT = 1000; // ms - for normal UI operations

// Simplified test that directly applies changes to the page
test('homepage has title and basic components', async ({ page }) => {
  await page.goto('/');
  
  // Assert that the page title contains the project name
  await expect(page).toHaveTitle('Flashcard From Document');
  
  // Assert that the main title is visible
  const mainTitle = page.locator('h1');
  await expect(mainTitle).toBeVisible({ timeout: NORMAL_TIMEOUT });
  await expect(mainTitle).toContainText('Flashcard From Document');
  
  // Either the API key input or document uploader should be visible
  const apiKeyInput = page.locator('.api-key-input');
  await expect(apiKeyInput).toBeVisible({ timeout: NORMAL_TIMEOUT });
});

test('API key input form can be submitted', async ({ page }) => {
  await page.goto('/');
  
  // Check that API key component exists
  const apiKeySection = page.locator('.api-key-input');
  await expect(apiKeySection).toBeVisible({ timeout: NORMAL_TIMEOUT });
  
  // Enter an API key
  const testKey = 'test-api-key-123';
  await page.locator('.api-key-input input').fill(testKey);
  await page.locator('.api-key-input button').click();
  
  // Verify the key status changes
  await expect(page.locator('.key-status')).toBeVisible({ timeout: NORMAL_TIMEOUT });
});

test('verify the localStorage reactivity issue', async ({ page }) => {
  // Go to page and fill the API key form
  await page.goto('/');
  
  // If we see the API key form, fill it in
  if (await page.locator('.api-key-input input').isVisible()) {
    await page.locator('.api-key-input input').fill('test-api-key-123');
    await page.locator('.api-key-input button').click();
  }
  
  // Wait for any main content to be visible - API Key section is visible in the screenshot
  await page.waitForSelector('.api-key-input', { timeout: NORMAL_TIMEOUT });
  
  // Now add a flashcard set directly to localStorage
  await page.evaluate(() => {
    // Create a sample flashcard set
    const mockSet = {
      id: 'test-set-id-' + Date.now(),
      name: 'Test Flashcard Set',
      cards: [
        {
          id: 'card1',
          question: 'What is a test?',
          answer: 'A procedure to verify functionality.',
          createdAt: new Date()
        }
      ],
      createdAt: new Date()
    };
    
    // Get current flashcard sets
    let sets = [];
    try {
      const stored = localStorage.getItem('flashcard-sets');
      if (stored) {
        sets = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error parsing localStorage:', e);
    }
    
    // Add the new set
    sets.push(mockSet);
    
    // Save back to localStorage
    localStorage.setItem('flashcard-sets', JSON.stringify(sets));
    
    // Simulate the storage event that would trigger in real usage
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'flashcard-sets',
      newValue: JSON.stringify(sets)
    }));
  });
  
  // Now check if the UI updates reactively (without page reload)
  // We use a very short timeout because reactivity should be near-instant
  let reactivityWorks = false;
  try {
    await page.waitForSelector('.set-selector', { timeout: SHORT_TIMEOUT });
    reactivityWorks = true;
  } catch (e) {
    console.log('REACTIVITY BUG: Set selector not appearing without page reload');
  }
  
  if (!reactivityWorks) {
    console.log('Testing if reload fixes the issue...');
    await page.reload();
    
    // After reload, the set should be visible
    await page.waitForSelector('.set-selector', { timeout: NORMAL_TIMEOUT });
    
    // Test fails - confirmed the reactivity bug
    throw new Error('REACTIVITY BUG: Flashcard sets only appear after page reload');
  }
  
  // If we got here, reactivity is working
  console.log('SUCCESS: Reactivity is working correctly');
});

test('page contains footer with version info', async ({ page }) => {
  await page.goto('/');
  
  // Footer should be visible
  const footer = page.locator('footer');
  await expect(footer).toBeVisible({ timeout: NORMAL_TIMEOUT });
  
  // Footer should contain version text
  await expect(footer).toContainText('Version');
  await expect(footer).toContainText('Powered by Anthropic\'s Claude API');
});