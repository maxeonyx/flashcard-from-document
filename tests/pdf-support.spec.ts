import { test, expect } from '@playwright/test';

// These timeouts are the same as in app.spec.ts
const SHORT_TIMEOUT = 16; // ms - single frame, for checking immediate reactivity
const NORMAL_TIMEOUT = 100; // ms - for normal UI operations that should be fast

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

// Wait for the store to be initialized before test begins
async function waitForStoreInitialization(page) {
  await page.waitForFunction(() => {
    return window.__flashcardStore && window.__flashcardMethods;
  }, { timeout: 2000 });
}

/**
 * Test for PDF upload and processing using Claude's native PDF capabilities
 * 
 * This test:
 * 1. Mocks the file upload capabilities to handle PDFs
 * 2. Mocks the Claude API response for PDF content
 * 3. Simulates uploading a PDF file
 * 4. Verifies that flashcards are generated correctly
 */
test('upload and process PDF document with Claude', async ({ page }) => {
  // Skip this test for now since PDF support is not yet implemented
  test.skip(true, 'PDF support not yet implemented');
  
  // Go to page and set API key
  await page.goto('/');
  await waitForStoreInitialization(page);
  
  // Set API key if needed
  if (await page.locator('.api-key-input input').isVisible()) {
    await page.locator('.api-key-input input').fill('test-api-key-123');
    await page.locator('.api-key-input button').click();
  }
  
  // Mock file upload and base64 encoding for PDFs
  await page.addInitScript(() => {
    // Add helper functions to window for PDF handling
    window.pdfFileToBase64 = async (file) => {
      // In a real implementation, this would read the file and convert to base64
      // For testing, we return a mock base64 string
      return 'MOCK_PDF_BASE64_DATA';
    };
    
    // Mock FileReader to handle PDFs
    const originalFileReader = window.FileReader;
    window.FileReader = class MockFileReader extends originalFileReader {
      constructor() {
        super();
        this.onload = null;
      }
      
      readAsArrayBuffer(blob) {
        // For PDFs, return a mock array buffer
        if (blob.name?.toLowerCase().endsWith('.pdf')) {
          setTimeout(() => {
            this.result = new ArrayBuffer(1024); // Mock buffer
            if (this.onload) this.onload({ target: this });
            this.dispatchEvent(new Event('load'));
          }, 10);
        } else {
          // Use original implementation for non-PDFs
          const originalReadAsArrayBuffer = originalFileReader.prototype.readAsArrayBuffer;
          originalReadAsArrayBuffer.call(this, blob);
        }
      }
      
      readAsText(blob) {
        // For PDFs, return a placeholder text
        if (blob.name?.toLowerCase().endsWith('.pdf')) {
          setTimeout(() => {
            this.result = `[PDF Document: ${blob.name}]`;
            if (this.onload) this.onload({ target: this });
            this.dispatchEvent(new Event('load'));
          }, 10);
        } else {
          // Use original for text files
          const originalReadAsText = originalFileReader.prototype.readAsText;
          originalReadAsText.call(this, blob);
        }
      }
    };
  });
  
  // Mock the Claude API response for PDF processing
  await page.route('**/*', async (route) => {
    // Only intercept API calls to Claude
    if (route.request().url().includes('anthropic.com')) {
      // Check the request body to see if it includes PDF data
      const body = route.request().postDataJSON();
      const hasPdfContent = body?.messages?.[0]?.content?.some(
        item => item.type === 'image' && item.source?.media_type === 'application/pdf'
      );
      
      // Return a PDF-specific response if PDF is detected
      if (hasPdfContent) {
        console.log('Intercepted PDF request to Claude API');
      }
      
      // Return a successful response with flashcards in proper JSON format
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                title: 'ESLint Configuration Guide',
                cards: [
                  {
                    question: 'What are the main configuration file types for ESLint?',
                    answer: 'JavaScript, JSON, and YAML files.'
                  },
                  {
                    question: 'What are glob patterns used for in ESLint config?',
                    answer: 'To specify which files a configuration applies to using the "files" and "ignores" properties.'
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
  
  // Create a mock PDF file for upload
  await page.evaluate(() => {
    // Create a mock PDF file
    const mockPdf = new File(
      [new Uint8Array(10).fill(1)], // Mock binary content
      'eslint-config.pdf',
      { type: 'application/pdf' }
    );
    
    // Create a mock drop event with the PDF file
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(mockPdf);
    
    // Dispatch the drop event on the upload area
    const uploadArea = document.querySelector('.upload-area');
    if (uploadArea) {
      const dropEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dropEvent, 'dataTransfer', { value: dataTransfer });
      dropEvent.preventDefault = () => {};
      uploadArea.dispatchEvent(dropEvent);
    }
  });
  
  // Verify document preview appears with PDF indicator
  await expect(page.locator('.document-preview')).toBeVisible({ timeout: NORMAL_TIMEOUT });
  await expect(page.locator('.document-content')).toContainText('PDF Document', { timeout: NORMAL_TIMEOUT });
  
  // Generate flashcards from the PDF
  await page.locator('.btn-primary').click();
  
  // Verify flashcard display appears
  await expect(page.locator('.flashcard-display')).toBeVisible({ timeout: NORMAL_TIMEOUT });
  
  // Verify flashcard content
  const cardContent = await page.locator('.card-front, .flashcard-content').first().textContent();
  expect(cardContent?.includes('ESLint')).toBeTruthy();
});