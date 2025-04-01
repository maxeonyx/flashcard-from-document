# PDF Support Test Plan: PDF Text Extraction

## Overview

This test plan outlines our approach to implementing PDF support in the Flashcard From Document app using client-side PDF text extraction. Based on our research, Claude's API currently doesn't support direct PDF upload as multimodal content (despite documentation suggesting otherwise), so we'll need to extract the text from PDFs client-side and send the text to Claude.

## Research Scripts

We've created two Node.js scripts to test PDF processing approaches:

### 1. Direct PDF Upload Attempt (pdf-test.ts)

```
cd /workspaces/flashcard-from-document/research
ANTHROPIC_API_KEY=your_api_key npm run test
```

This script attempts to send a PDF directly to Claude as multimodal content, but currently fails with an API error as Claude doesn't accept PDF as a valid media type.

### 2. PDF Text Extraction (pdf-text-extraction.ts)

```
cd /workspaces/flashcard-from-document/research
ANTHROPIC_API_KEY=your_api_key npm run test:extract
```

#### What the extraction script does:
1. Loads a PDF file from the test-resources directory
2. Extracts text using the pdf-parse library
3. Sends the extracted text to Claude API
4. Processes the response to generate flashcards
5. Outputs the results to the console

#### Expected results:
- The script should successfully extract text from the PDF
- Claude should process the extracted text
- The response should be properly formatted JSON with flashcards
- The flashcards should be relevant to the PDF content

## Implementation Plan for App

### 1. Update Document Upload Flow with PDF.js

#### In useDocumentUpload.ts:

```typescript
import { ref, computed } from 'vue';
import type { ApiResponse } from '../types';
// Import PDF.js for PDF text extraction
import * as pdfjsLib from 'pdfjs-dist';
// Set the worker path for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// New function to handle PDF files
async function handlePdfFile(file: File): Promise<ApiResponse<string>> {
  try {
    // Create a URL for the PDF file
    const fileURL = URL.createObjectURL(file);
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument(fileURL);
    const pdf = await loadingTask.promise;
    
    // Initialize content variable
    let extractedText = '';
    
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map(item => 'str' in item ? item.str : '')
        .join(' ');
      
      extractedText += pageText + '\n\n';
    }
    
    // Clean up the URL
    URL.revokeObjectURL(fileURL);
    
    // Set document content for display
    documentContent.value = extractedText;
    fileName.value = file.name;
    error.value = '';
    
    // Return the extracted text
    return { data: extractedText, loading: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    error.value = `Error reading PDF file: ${message}`;
    return { error: error.value, loading: false };
  }
}

// Update processFile to use the PDF handler
function processFile(file: File): Promise<ApiResponse<any>> {
  const fileType = file.name.split('.').pop()?.toLowerCase();
  
  if (fileType === 'txt' || fileType === 'md') {
    return handleTextFile(file);
  } else if (fileType === 'pdf') {
    return handlePdfFile(file);
  } else {
    error.value = "Unsupported file format. Please upload a .txt, .md, or .pdf file.";
    return Promise.resolve({ error: error.value, loading: false });
  }
}
```

### 2. Add PDF.js Dependency

In `package.json`, add:

```json
"dependencies": {
  "pdfjs-dist": "^3.10.111"
}
```

### 3. No Changes Needed to Claude Service

Since we're extracting text from PDFs and sending as plain text, the claude.ts service doesn't need any changes. It will continue to work with text content as it currently does.

### 4. No Changes Needed to Flashcard Generation

The useFlashcardGeneration.ts composable doesn't need changes either, as it already handles text content correctly.

## Test Plan for App Implementation

### Test 1: PDF File Upload Test

```typescript
test('upload PDF file and verify content processing', async ({ page }) => {
  await page.goto('/');
  await waitForStoreInitialization(page);
  
  // Set API key
  if (await page.locator('.api-key-input input').isVisible()) {
    await page.locator('.api-key-input input').fill('test-api-key-123');
    await page.locator('.api-key-input button').click();
  }
  
  // Mock PDF.js functionality
  await page.addInitScript(() => {
    // Create a fake PDF.js environment
    window.pdfjsLib = {
      version: '3.10.111',
      GlobalWorkerOptions: {
        workerSrc: ''
      },
      getDocument: (url) => ({
        promise: Promise.resolve({
          numPages: 2,
          getPage: (pageNum) => Promise.resolve({
            getTextContent: () => Promise.resolve({
              items: [
                { str: 'This is ' },
                { str: 'extracted text ' },
                { str: 'from a PDF ' },
                { str: 'document. ' },
                { str: pageNum === 1 ? 
                  'Page 1 discussing ESLint configuration files.' : 
                  'Page 2 discussing configuration options.' }
              ]
            })
          })
        })
      })
    };

    // Mock URL methods
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;
    
    URL.createObjectURL = (file) => {
      return `blob:fake-url-for-${file.name}`;
    };
    
    URL.revokeObjectURL = (url) => {
      // Do nothing
    };
    
    // Save originals for cleanup
    window.__originalCreateObjectURL = originalCreateObjectURL;
    window.__originalRevokeObjectURL = originalRevokeObjectURL;
  });
  
  // Mock Claude API response
  await page.route('**/*anthropic.com**', async route => {
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
  });
  
  // Upload a mocked PDF file
  await page.evaluate(() => {
    // Create a mock PDF file
    const mockPdf = new File(
      [new Uint8Array(10).fill(1)], // Mock binary content
      'eslint-config.pdf',
      { type: 'application/pdf' }
    );
    
    // Mock data transfer object with the file
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(mockPdf);
    
    // Create a drop event
    const dropEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dropEvent, 'dataTransfer', { value: dataTransfer });
    dropEvent.preventDefault = () => {};
    
    // Find the upload area and dispatch the event
    const uploadArea = document.querySelector('.upload-area');
    if (uploadArea) uploadArea.dispatchEvent(dropEvent);
  });
  
  // Check for PDF extraction in the document preview
  await expect(page.locator('.document-preview')).toBeVisible({ timeout: NORMAL_TIMEOUT });
  await expect(page.locator('.document-content')).toContainText('ESLint configuration', { timeout: NORMAL_TIMEOUT });
  
  // Generate flashcards
  await page.locator('.btn-primary').click();
  
  // Verify flashcards are generated
  await expect(page.locator('.flashcard-display')).toBeVisible({ timeout: NORMAL_TIMEOUT });
  
  // Verify content of first card
  const cardContent = await page.locator('.card-front, .flashcard-content').first().textContent();
  expect(cardContent?.includes('ESLint')).toBeTruthy();
  
  // Clean up mock
  await page.evaluate(() => {
    // Restore original URL methods if they were saved
    if (window.__originalCreateObjectURL) {
      URL.createObjectURL = window.__originalCreateObjectURL;
    }
    if (window.__originalRevokeObjectURL) {
      URL.revokeObjectURL = window.__originalRevokeObjectURL;
    }
  });
});
```

## Future Enhancements

1. **PDF Chunking**: For large PDFs, implement chunking to stay within token limits
2. **Progress Indicator**: Add a more detailed progress indicator for PDF processing
3. **PDF Preview**: Implement a PDF preview component that shows thumbnails of pages
4. **PDF Extraction Options**: Allow users to select specific pages or sections
5. **Error Recovery**: Implement graceful fallbacks if Claude's PDF processing fails

## Success Criteria

1. Users can upload PDF files and generate flashcards
2. PDF generation correctly preserves content context including formatting
3. Error handling gracefully manages invalid PDFs
4. Performance is acceptable for typical PDF sizes (5-20 pages)
5. Tests pass consistently for PDF upload and processing