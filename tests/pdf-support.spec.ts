import { test, expect } from '@playwright/test';

// Timeouts are intentionally short to catch reactivity issues
// SHORT_TIMEOUT is used for immediate reactivity checks (but not in this test file yet)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SHORT_TIMEOUT = 16; // ms - single frame
const NORMAL_TIMEOUT = 100; // ms - for normal UI operations

// Wait for the store to be initialized
async function waitForStoreInitialization(page) {
  await page.waitForFunction(() => {
    return window.__flashcardStore && window.__flashcardMethods;
  }, { timeout: 2000 });
}

// This would be used for more advanced PDF testing if needed
// Currently not used as we're mocking at the request level instead
/* eslint-disable @typescript-eslint/no-unused-vars */
async function createMockPdfBase64(page) {
  return await page.evaluate(() => {
    // This is a minimal representation of a base64 encoded PDF
    // In real implementation, this would be the actual PDF converted to base64
    return 'JVBERi0xLjcKJeLjz9MKNSAwIG9iago8PCAvTGVuZ3RoIDYgMCBSCiAgIC9GaWx0ZXIgL0ZsYXRlRGVjb2RlCj4+CnN0cmVhbQp4nDPQM1Qo5ypUMFAw1DNSKG+rzMzLTHJOLMnMzwMA9IUO8gplbmRzdHJlYW0KZW5kb2JqCjYgMCBvYmoKICAgMzk3CmVuZG9iagozzCAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZwogICAvUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzCiAgIC9LaWRzIFszIDAgUl0KICAgL0NvdW50IDEKICAgL01lZGlhQm94IFswIDAgMzAwIDEyMF0KPj4KZW5kb2JqCjMgMCBvYmoKPDwgIC9UeXBlIC9QYWdlCiAgIC9QYXJlbnQgMiAwIFIKICAgL1Jlc291cmNlcyA8PCAvRm9udCA8PCAvRjEgNCAwIFIgPj4gPj4KICAgL0NvbnRlbnRzIDUgMCBSCj4+CmVuZG9iago0IDAgb2JqCjw8IC9UeXBlIC9Gb250CiAgIC9TdWJ0eXBlIC9UeXBlMQogICAvQmFzZUZvbnQgL1RpbWVzLVJvbWFuCj4+CmVuZG9iagoxIDAgb2JqCjw8IC9UaXRsZSAoRVNMaW50IENvbmZpZ3VyYXRpb24gRG9jdW1lbnQpCiAgIC9BdXRob3IgKFRlc3QpCiAgIC9DcmVhdG9yIChUZXN0KQo+PgplbmRvYmoKeHJlZgowIDcKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwODc5IDAwMDAwIG4gCjAwMDAwMDA1NDMgMDAwMDAgbiAKMDAwMDAwMDYzOSAwMDAwMCBuIAowMDAwMDAwNzc2IDAwMDAwIG4gCjAwMDAwMDAwMTcgMDAwMDAgbiAKMDAwMDAwMDQ5MiAwMDAwMCBuIAp0cmFpbGVyCjw8ICAvUm9vdCAxIDAgUgogICAvU2l6ZSA3Cj4+CnN0YXJ0eHJlZgo5NjkKJSVFT0YK';
  });
}
/* eslint-enable @typescript-eslint/no-unused-vars */

test('PDF upload and flashcard generation', async ({ page }) => {
  await page.goto('/');
  await waitForStoreInitialization(page);
  
  // Mock the Claude API response for PDF documents
  await page.route('**/*', async (route) => {
    // Only intercept API calls to Claude
    if (route.request().url().includes('anthropic.com')) {
      // Check if the request includes PDF document content
      const requestBody = route.request().postDataJSON();
      const isPdfRequest = requestBody?.messages?.[0]?.content?.some(
        content => content.type === 'document' && content.source?.media_type === 'application/pdf'
      );
      
      if (isPdfRequest) {
        console.log('Intercepted PDF request to Claude API');
        
        // Return a successful response with flashcards in proper JSON format
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  title: 'ESLint Configuration',
                  cards: [
                    {
                      question: 'What is ESLint?',
                      answer: 'ESLint is a static code analysis tool for identifying problematic patterns in JavaScript code.'
                    },
                    {
                      question: 'How are ESLint configuration files typically named?',
                      answer: 'ESLint configuration files are typically named .eslintrc.js, .eslintrc.json, .eslintrc.yaml, or eslint.config.js (for flat config).'
                    },
                    {
                      question: 'What is a flat config in ESLint?',
                      answer: 'Flat config is a new configuration format introduced in ESLint v8.21.0 that uses a single eslint.config.js file with a simpler, more predictable configuration structure.'
                    }
                  ]
                })
              }
            ],
            id: 'mock-pdf-response',
            model: 'claude-3-5-sonnet-20241022',
            type: 'message'
          })
        });
      } else {
        // Continue with regular Claude API call
        await route.continue();
      }
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
  
  // Wait for the document uploader to be visible
  await page.waitForSelector('.document-uploader', { timeout: NORMAL_TIMEOUT });
  
  // Create and upload a mock PDF file
  // This uses Playwright's built-in file upload functionality
  await page.setInputFiles('input[type="file"]', {
    name: 'test-config.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('PDF content mock', 'utf8')
  });
  
  // Once the PDF is uploaded, we should see the document preview
  // This will fail until PDF support is implemented
  await expect(page.locator('.document-preview')).toBeVisible({ timeout: NORMAL_TIMEOUT });
  
  // Click the generate flashcards button
  await page.locator('button:has-text("Generate")').click();
  
  // The flashcard display should appear
  const flashcardDisplay = page.locator('.flashcard-display');
  await expect(flashcardDisplay).toBeVisible({ timeout: NORMAL_TIMEOUT });
  
  // Verify that the ESLint-specific cards appear 
  const cardContent = await page.locator('.card-front, .flashcard-content').textContent();
  expect(cardContent).toContain('What is ESLint?');
});

test('PDF button is visible in document uploader', async ({ page }) => {
  await page.goto('/');
  await waitForStoreInitialization(page);
  
  // If we see the API key form, fill it in
  if (await page.locator('.api-key-input input').isVisible()) {
    await page.locator('.api-key-input input').fill('test-api-key-123');
    await page.locator('.api-key-input button').click();
  }
  
  // Wait for the document uploader to be visible
  await page.waitForSelector('.document-uploader', { timeout: NORMAL_TIMEOUT });
  
  // Verify that the uploader mentions PDF support
  const uploaderText = await page.locator('.document-uploader').textContent();
  expect(uploaderText).toContain('PDF');
  
  // Check that the supported-formats element specifically contains PDF
  const formatsText = await page.locator('.supported-formats').textContent();
  expect(formatsText).toContain('PDF');
});