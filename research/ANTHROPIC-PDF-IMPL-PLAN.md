# Anthropic Native PDF Support Implementation Plan

Based on Anthropic's documentation, Claude supports direct PDF processing as a multimodal input via the "document" content type. This document outlines how to implement this capability in our Flashcard From Document application.

## How Anthropic's PDF Support Works

According to the documentation:

1. PDFs can be provided to Claude in two ways:
   - As a base64-encoded PDF in document content blocks
   - As a URL reference to a PDF hosted online

2. When Claude processes a PDF:
   - The system extracts the contents of the document
   - Each page is converted into an image
   - Text is extracted and provided alongside each page's image
   - Claude analyzes both text and images to understand the document

## Implementation Plan

### 1. Update Document Upload Component

We need to modify `useDocumentUpload.ts` to handle PDF files and convert them to base64:

```typescript
// Add function to handle PDF files
async function handlePdfFile(file: File): Promise<ApiResponse<string>> {
  try {
    // Convert PDF to base64 for Claude API
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    
    // Store the original filename
    fileName.value = file.name;
    
    // We don't need to extract text, just return the base64 data
    // Let Claude handle the PDF content extraction
    return { 
      data: base64, 
      loading: false 
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    error.value = `Error processing PDF file: ${message}`;
    return { error: error.value, loading: false };
  }
}

// Update processFile function
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

### 2. Update Claude Service

Modify `claude.ts` to support sending PDFs as document content blocks:

```typescript
// Add new interface for document uploads
export interface DocumentUpload {
  text?: string;
  pdfBase64?: string;
  fileName: string;
}

// Update the generateFlashcards method
async generateFlashcards(document: DocumentUpload): Promise<FlashcardGenerationResult> {
  if (!this.client) {
    return {
      title: '',
      cards: [],
      error: 'API key not set. Please set your Claude API key in the settings.'
    };
  }

  try {
    const messageContent: any[] = [];
    
    // If we have a PDF, add it as a document content block
    if (document.pdfBase64) {
      messageContent.push({
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data: document.pdfBase64
        }
      });
    }
    
    // Add the text prompt (always add this after the PDF)
    messageContent.push({
      type: 'text',
      text: `Create flashcards from this ${document.pdfBase64 ? 'PDF' : 'document'}. Extract key concepts and create question-answer pairs.

IMPORTANT: Your entire response must be valid JSON that I can parse with JSON.parse(). Respond with ONLY a JSON object containing a "title" string field and a "cards" array field that contains objects with "question" and "answer" fields like this:

{
  "title": "A descriptive title for this flashcard set",
  "cards": [
    {
      "question": "What is...",
      "answer": "It is..."
    }
  ]
}

The title should be concise (3-6 words) and descriptive of the document's content. Do not include any explanations, markdown formatting, or non-JSON text in your response.${
        document.text && !document.pdfBase64 ? `\n\nDocument text:\n${document.text}` : ''
      }`
    });
    
    // Send the request to Claude
    const response = await this.client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: 'user',
          content: messageContent,
        },
      ],
    });

    // Process response (remainder of function unchanged)
    // ...
  }
}
```

### 3. Update Flashcard Generation Component

Update `useFlashcardGeneration.ts` to work with the new Claude service:

```typescript
async function generateFlashcards(
  apiKey: string, 
  documentContent: string,
  fileName: string,
  pdfBase64?: string
): Promise<FlashcardSet | null> {
  if (!apiKey || (!documentContent && !pdfBase64)) {
    error.value = !apiKey 
      ? "Please set your Claude API key first" 
      : "Please upload a document first";
    return null;
  }

  error.value = '';
  isGenerating.value = true;
  
  try {
    const claudeService = new ClaudeService(apiKey);
    
    // Pass document content as either text or PDF
    const result = await claudeService.generateFlashcards({
      text: documentContent,
      pdfBase64,
      fileName
    });
    
    // Rest of the function unchanged
    // ...
  }
}
```

### 4. Update DocumentUploader.vue

Add a loading state for PDF processing in the document uploader component:

```typescript
// Update the onGenerateFlashcards function
async function onGenerateFlashcards(): Promise<void> {
  // If we have a PDF, we pass the base64 content
  // If not, we use the text content
  const fileType = fileName.value.split('.').pop()?.toLowerCase();
  const isPdf = fileType === 'pdf';
  
  const newSet = await generateFlashcards(
    apiKey.value, 
    isPdf ? `[PDF: ${fileName.value}]` : documentContent.value, 
    fileName.value,
    isPdf ? documentContent.value : undefined // For PDFs, documentContent will contain base64
  );
  
  if (newSet) {
    emit('flashcardsGenerated', newSet);
    clearDocument();
  }
}
```

### 5. Testing PDF Support

Create a test that verifies our PDF support is working as expected:

```typescript
test('upload and process PDF document', async ({ page }) => {
  await page.goto('/');
  await waitForStoreInitialization(page);
  
  // Set API key if needed
  if (await page.locator('.api-key-input input').isVisible()) {
    await page.locator('.api-key-input input').fill('test-api-key-123');
    await page.locator('.api-key-input button').click();
  }
  
  // Mock file upload for PDFs
  await page.addInitScript(() => {
    // Mock FileReader for PDFs
    const originalFileReader = window.FileReader;
    window.FileReader = class MockFileReader extends originalFileReader {
      constructor() {
        super();
      }
      
      readAsArrayBuffer(blob) {
        // For PDFs, return a mock array buffer that will convert to base64
        setTimeout(() => {
          this.result = new ArrayBuffer(10); // Mock buffer
          this.dispatchEvent(new Event('load'));
        }, 10);
      }
    };
    
    // Mock the arrayBuffer function of the File prototype
    const originalArrayBuffer = File.prototype.arrayBuffer;
    File.prototype.arrayBuffer = function() {
      if (this.name.endsWith('.pdf')) {
        return Promise.resolve(new ArrayBuffer(10));
      }
      return originalArrayBuffer.call(this);
    };
    
    // Mock btoa to return a predictable string for testing
    const originalBtoa = window.btoa;
    window.btoa = function(data) {
      if (data.length === 10) {
        return "MOCK_PDF_BASE64"; // Mock base64 for our PDF
      }
      return originalBtoa(data);
    };
  });
  
  // Mock Claude API for PDF processing
  await page.route('**/*anthropic.com**', async route => {
    const body = route.request().postDataJSON();
    const hasPdfContent = body?.messages?.[0]?.content?.some(
      item => item.type === 'document' && 
             item.source?.type === 'base64' && 
             item.source?.media_type === 'application/pdf'
    );
    
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              title: 'PDF Document Flashcards',
              cards: [
                {
                  question: 'What format does Claude accept PDFs in?',
                  answer: 'Claude accepts PDFs as base64-encoded data or from URL references.'
                },
                {
                  question: 'What are the size limits for PDFs?',
                  answer: 'Maximum request size is 32MB and maximum 100 pages per request.'
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
  
  // Upload a PDF file
  await page.evaluate(() => {
    const mockPdf = new File(
      [new Uint8Array(10)], 
      'document.pdf',
      { type: 'application/pdf' }
    );
    
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(mockPdf);
    
    const dropEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dropEvent, 'dataTransfer', { value: dataTransfer });
    dropEvent.preventDefault = () => {};
    
    const uploadArea = document.querySelector('.upload-area');
    if (uploadArea) uploadArea.dispatchEvent(dropEvent);
  });
  
  // Verify PDF was uploaded
  await expect(page.locator('.document-preview')).toBeVisible({ timeout: NORMAL_TIMEOUT });
  
  // Generate flashcards
  await page.locator('.btn-primary').click();
  
  // Verify flashcard display appears
  await expect(page.locator('.flashcard-display')).toBeVisible({ timeout: NORMAL_TIMEOUT });
  
  // Verify content of cards
  const cardContent = await page.locator('.card-front, .flashcard-content').first().textContent();
  expect(cardContent?.includes('format does Claude')).toBeTruthy();
});
```

## PDF Requirements & Limits

Based on the documentation, we should be aware of these limits:

- Maximum request size: 32MB
- Maximum pages per request: 100
- Format: Standard PDF (no passwords/encryption)

We may want to add validation to ensure uploaded PDFs meet these requirements.

## Conclusion

This implementation approach leverages Anthropic's native PDF support, sending PDFs directly to Claude rather than extracting text client-side. This should provide better results as Claude can analyze both the text and visual elements of the PDF.