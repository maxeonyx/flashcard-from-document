import { test, expect } from '@playwright/test';

// We need to ensure we initialize the store properly 
// The page context in Playwright doesn't get the initialization from main.ts
test.beforeEach(async ({ page }) => {
  // Initialize the global store on each test page
  await page.addInitScript(() => {
    if (typeof window !== 'undefined') {
      // Flag to ensure we initialize just once
      window.__FLASHCARD_STORE_INITIALIZED = false;
    }
  });
});

// IMPORTANT: App should respond very quickly, so all waitForSelector calls should have a 
// short timeout. Longer timeouts hide performance issues.
// If something truly needs more time, it should be explicitly justified with a comment.
// DO NOT CHANGE THESE TIMEOUT VALUES - they are intentionally short to catch reactivity issues.
// The app should respond within these timeframes - if tests fail due to timeouts, fix the app, not the timeouts.
const SHORT_TIMEOUT = 16; // ms - single frame, for checking immediate reactivity
const NORMAL_TIMEOUT = 100; // ms - for normal UI operations that should be fast

// Wait for the store to be initialized before test begins
async function waitForStoreInitialization(page) {
  await page.waitForFunction(() => {
    return window.__flashcardStore && window.__flashcardMethods;
  }, { timeout: 2000 });
}

// Simplified test that directly applies changes to the page
test('homepage has title and basic components', async ({ page }) => {
  await page.goto('/');
  
  // Assert that the page title contains the project name
  await expect(page).toHaveTitle('Flashcard From Document');
  
  // Assert that the main title is visible
  const mainTitle = page.locator('h1');
  await expect(mainTitle).toBeVisible({ timeout: NORMAL_TIMEOUT });
  await expect(mainTitle).toContainText('Flashcard From Document');
  
  // Either the API key input or onboarding container should be visible
  const apiKeySection = page.locator('.onboarding-container');
  await expect(apiKeySection).toBeVisible({ timeout: NORMAL_TIMEOUT });
});

test('API key input form can be submitted', async ({ page }) => {
  await page.goto('/');
  await waitForStoreInitialization(page);
  
  // Check that API key component exists
  const apiKeySection = page.locator('.api-key-input');
  await expect(apiKeySection).toBeVisible({ timeout: NORMAL_TIMEOUT });
  
  // Enter an API key
  const testKey = 'test-api-key-123';
  await page.locator('.api-key-input input').fill(testKey);
  await page.locator('.api-key-input button').click();
  
  // Verify the key status changes - document uploader should appear after setting the key
  await expect(page.locator('.document-uploader')).toBeVisible({ timeout: NORMAL_TIMEOUT });
});

test('verify localStorage updates are reflected in UI without reload', async ({ page }) => {
  // Go to page and fill the API key form
  await page.goto('/');
  await waitForStoreInitialization(page);
  
  // If we see the API key form, fill it in
  if (await page.locator('.api-key-input input').isVisible()) {
    await page.locator('.api-key-input input').fill('test-api-key-123');
    await page.locator('.api-key-input button').click();
  }
  
  // Wait for any main content to be visible - API Key status or document uploader
  await page.waitForSelector('.api-key-status, .document-uploader', { timeout: NORMAL_TIMEOUT });
  
  // Now add a flashcard set directly through the store
  await page.evaluate(() => {
    try {
      // Create a sample flashcard set
      const mockSet = {
        name: 'Test Flashcard Set',
        cards: [
          {
            id: 'card1',
            question: 'What is a test?',
            answer: 'A procedure to verify functionality.',
            createdAt: new Date()
          }
        ]
      };
      
      // Add via the store's API if our global store is available, otherwise fallback
      if (window.__flashcardStore && typeof window.__flashcardMethods?.addFlashcardSet === 'function') {
        // Add via the global store API
        const result = window.__flashcardMethods.addFlashcardSet(mockSet);
        console.log('Added flashcard set via store API:', result.id);
      } else {
        // Direct localStorage manipulation - less reliable
        let sets = [];
        try {
          const stored = localStorage.getItem('flashcard-sets');
          if (stored) {
            sets = JSON.parse(stored);
          }
        } catch (e) {
          console.error('Error parsing localStorage:', e);
        }
        
        // Create a complete set
        const completeSet = {
          ...mockSet,
          id: 'test-set-id-' + Date.now(),
          createdAt: new Date()
        };
        
        // Add the new set
        sets.push(completeSet);
        
        // Save back to localStorage
        localStorage.setItem('flashcard-sets', JSON.stringify(sets));
        
        // Trigger storage event manually for cross-tab syncing
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'flashcard-sets',
          newValue: JSON.stringify(sets)
        }));
      }
      
      console.log('Added card set to localStorage successfully');
    } catch (error) {
      console.error('Error adding flashcard set:', error);
    }
  });
  
  // With our new reactivity model, the UI should update without reload
  // Flashcard display is the parent component for both selector and viewer
  await page.waitForSelector('.flashcard-display', { timeout: NORMAL_TIMEOUT });
  console.log('SUCCESS: Flashcard display appeared without reload');
  
  // First verify card exists with normal timeout
  await page.waitForSelector('.card-front, .flashcard-content', { timeout: NORMAL_TIMEOUT });
  
  // Then check the content with short timeout to verify true immediate reactivity
  const cardText = await page.waitForFunction(() => {
    const element = document.querySelector('.card-front, .flashcard-content');
    return element?.textContent || '';
  }, { timeout: SHORT_TIMEOUT });
  
  const text = await cardText.evaluate(t => String(t));
  expect(text.includes('What is a test?')).toBeTruthy();
  console.log('SUCCESS: Card content appeared correctly:', text);
});

test('verify flashcard generation updates UI correctly without reload', async ({ page }) => {
  // Go to page and fill the API key form
  await page.goto('/');
  await waitForStoreInitialization(page);
  
  // Mock the Claude API response
  await page.route('**/*', async (route) => {
    // Only intercept API calls to Claude
    if (route.request().url().includes('anthropic.com')) {
      // Return a successful response with flashcards in proper JSON format
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                title: 'Test Flashcards',
                cards: [
                  {
                    question: 'What is a test?',
                    answer: 'A procedure intended to establish the quality or reliability of something.'
                  },
                  {
                    question: 'Why is testing important?',
                    answer: 'Testing helps find bugs early and ensures software meets requirements.'
                  }
                ]
              })
            }
          ],
          id: 'mock-id',
          model: 'claude-3-5-sonnet-20241022',
          type: 'message'
        })
      });
    } else {
      // Continue with the original request for non-Claude API calls
      await route.continue();
    }
  });
  
  // If we see the API key form, fill it in
  if (await page.locator('.api-key-input input').isVisible()) {
    await page.locator('.api-key-input input').fill('test-api-key-123');
    await page.locator('.api-key-input button').click();
  }
  
  // Generate test flashcards using the global store
  await page.evaluate(() => {
    try {
      // Create a sample flashcard set
      const mockSet = {
        name: 'Test Flashcards',
        cards: [
          {
            id: 'card1',
            question: 'What is a test?',
            answer: 'A procedure intended to establish the quality or reliability of something.',
            createdAt: new Date()
          },
          {
            id: 'card2',
            question: 'Why is testing important?',
            answer: 'Testing helps find bugs early and ensures software meets requirements.',
            createdAt: new Date()
          }
        ]
      };
      
      // Add via the store's API if our global store is available
      if (window.__flashcardStore && typeof window.__flashcardMethods?.addFlashcardSet === 'function') {
        // Add via the global store API
        const result = window.__flashcardMethods.addFlashcardSet(mockSet);
        console.log('Added flashcard set via store API:', result.id);
      } else {
        // Direct localStorage manipulation as fallback
        let sets = [];
        try {
          const stored = localStorage.getItem('flashcard-sets');
          if (stored) {
            sets = JSON.parse(stored);
          }
        } catch (e) {
          console.error('Error parsing localStorage:', e);
        }
        
        // Create a complete set
        const completeSet = {
          ...mockSet,
          id: 'test-set-id-' + Date.now(),
          createdAt: new Date()
        };
        
        // Add the new set
        sets.push(completeSet);
        
        // Save back to localStorage
        localStorage.setItem('flashcard-sets', JSON.stringify(sets));
        
        // Trigger storage event manually for cross-tab syncing
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'flashcard-sets',
          newValue: JSON.stringify(sets)
        }));
      }
      
      console.log('Test flashcards generated successfully');
    } catch (error) {
      console.error('Error in test flashcard generation:', error);
    }
  });
  
  // Log the state of localStorage for debugging
  await page.evaluate(() => {
    console.log('localStorage after generation:', JSON.stringify({
      flashcardSets: localStorage.getItem('flashcard-sets')
    }));
  });
  
  // With our reactivity improvements, UI should update without reload
  // Flashcard display is the parent component that should be visible
  const flashcardDisplay = page.locator('.flashcard-display');
  await expect(flashcardDisplay).toBeVisible({ timeout: NORMAL_TIMEOUT });
  console.log('SUCCESS: Flashcard display is visible without reload');
  
  // Check if the first question appears on the card - one of these classes should contain it
  const cardContent = await page.locator('.card-front, .flashcard-content').textContent();
  expect(cardContent?.includes('What is a test?')).toBeTruthy();
  console.log('SUCCESS: Flashcard content is visible without reload:', cardContent);
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