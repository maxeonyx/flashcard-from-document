import { test, expect } from '@playwright/test';

test('homepage has correct title and components', async ({ page }) => {
  await page.goto('/');
  
  // Assert that the page title contains the project name
  await expect(page).toHaveTitle('Flashcard From Document');
  
  // Assert that the main title is visible
  const mainTitle = page.locator('h1');
  await expect(mainTitle).toBeVisible();
  await expect(mainTitle).toContainText('Flashcard From Document');
  
  // Check API key component
  const apiKeySection = page.locator('.api-key-input');
  await expect(apiKeySection).toBeVisible();
  await expect(apiKeySection.locator('h2')).toContainText('Claude API Key');
  
  // Check document uploader component
  const uploaderSection = page.locator('.document-uploader');
  await expect(uploaderSection).toBeVisible();
  await expect(uploaderSection.locator('h2')).toContainText('Upload Document');
  
  // Check flashcard display component
  const flashcardSection = page.locator('.flashcard-display');
  await expect(flashcardSection).toBeVisible();
  await expect(flashcardSection.locator('h2')).toContainText('No Flashcard Sets');
});

test('API key input works correctly', async ({ page }) => {
  await page.goto('/');
  
  // Initially should show "No API key set"
  await expect(page.locator('.key-status')).toContainText('No API key set');
  
  // Enter an API key
  const testKey = 'test-api-key-123';
  await page.locator('.api-key-input input').fill(testKey);
  await page.locator('.api-key-input button').click();
  
  // Should now show that the key is set
  await expect(page.locator('.key-status')).toContainText('API key is set');
  
  // Check that input field is cleared
  await expect(page.locator('.api-key-input input')).toHaveValue('');
});

test('document uploader shows appropriate UI states', async ({ page }) => {
  await page.goto('/');
  
  // Should initially show upload area
  const uploadArea = page.locator('.upload-area');
  await expect(uploadArea).toBeVisible();
  await expect(uploadArea).toContainText('Drag and drop your document here');
  
  // Create a simple text file for upload
  const testContent = 'This is a test document for flashcard generation.';
  
  // Use the page.setInputFiles method with DataTransfer to simulate file upload
  await page.evaluate(() => {
    const uploadArea = document.querySelector('.upload-area');
    if (!uploadArea) {
      throw new Error('Upload area element not found');
    }
    
    const dataTransfer = new DataTransfer();
    
    const file = new File([new Blob(['This is a test document for flashcard generation.'])], 'test.txt', { 
      type: 'text/plain' 
    });
    
    dataTransfer.items.add(file);
    const event = new DragEvent('drop', { dataTransfer });
    uploadArea.dispatchEvent(event);
  });
  
  // Should now show document preview
  await expect(page.locator('.document-preview')).toBeVisible();
  await expect(page.locator('.document-content')).toContainText(testContent);
  
  // Test clear button
  await page.locator('button:has-text("Clear")').click();
  
  // Should show upload area again
  await expect(uploadArea).toBeVisible();
  await expect(uploadArea).toContainText('Drag and drop your document here');
});