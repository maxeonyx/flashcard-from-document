# PDF Support Research

This directory contains research code for testing PDF support with Claude API before implementing it in the main application.

## Running the PDF Test Scripts

We have two approaches for handling PDFs:

### 1. Attempt at Direct PDF Upload (Not Currently Supported)

The `pdf-test.ts` script attempts to:
1. Load a PDF file from disk
2. Convert it to base64
3. Send it to Claude API as a multimodal message
4. Process the response to generate flashcards

> **Note:** This approach currently fails with an error as Claude API doesn't support PDF as a direct input format. The error is: "messages.0.content.1.image.source.base64.media_type: Input should be 'image/jpeg', 'image/png', 'image/gif' or 'image/webp'"

### 2. PDF Text Extraction (Recommended Approach)

Two options for text extraction:

#### Option A: Using pdf-parse (may have issues):
The `pdf-text-extraction.ts` script:
1. Loads a PDF file from disk
2. Extracts text using the pdf-parse library 
3. Sends the extracted text to Claude API
4. Processes the response to generate flashcards

#### Option B: Using pdftotext/fallback (more reliable):
The `pdf-text-extraction-fixed.ts` script:
1. Loads a PDF file from disk
2. First tries to extract text using the pdftotext command (requires poppler-utils)
3. Falls back to basic extraction if pdftotext fails
4. Sends the extracted text to Claude API
5. Processes the response to generate flashcards

## Prerequisites

Make sure you have Node.js installed and ts-node available:

```bash
npm install -g ts-node typescript
```

## Setup

Install dependencies in the research directory:

```bash
cd /workspaces/flashcard-from-document/research
npm install
```

## Running the Scripts

### Direct PDF Upload Attempt (Currently Fails)

```bash
cd /workspaces/flashcard-from-document/research
ANTHROPIC_API_KEY=your_api_key npm run test
```

### PDF Text Extraction - Option A (pdf-parse)

```bash
cd /workspaces/flashcard-from-document/research
ANTHROPIC_API_KEY=your_api_key npm run test:extract
```

### PDF Text Extraction - Option B (pdftotext/fallback)

```bash
cd /workspaces/flashcard-from-document/research
ANTHROPIC_API_KEY=your_api_key npm run test:extract:fixed
```

This option first tries to use pdftotext (requires poppler-utils) and falls back to a basic extraction method if that fails.

## Expected Output (Text Extraction)

The text extraction script will:
1. Load the PDF from test-resources
2. Extract text using pdf-parse
3. Send the extracted text to Claude API
4. Parse and display the flashcards returned by Claude

Example output:
```
Starting PDF test with text extraction...
Initializing Claude client...
Loading PDF from: /workspaces/flashcard-from-document/research/../test-resources/Configuration Files - ESLint - Pluggable JavaScript Linter.pdf
Extracting text from PDF: /workspaces/flashcard-from-document/research/../test-resources/Configuration Files - ESLint - Pluggable JavaScript Linter.pdf
PDF text extracted (12345 characters)
First 300 characters of extracted text:
--------------------------------------------------
# Configuration Files

You can use configuration files with ESLint to specify configuration information for an entire directory and all of its subdirectories. This can be useful for:

* Enforcing coding conventions across projects
--------------------------------------------------
Sending request to Claude API...
Response received from Claude API!

Raw response text:
-------------------
{"title":"ESLint Configuration Guide","cards":[{"question":"What are the two ways to use configuration files with ESLint?","answer":"Configuration Files (JavaScript, JSON, or YAML files) and Configuration Comments (JavaScript comments embedded in source code)."},{"question":"What are the three locations...
-------------------

Parsed flashcards:
Title: ESLint Configuration Guide
Cards: 10

Flashcards:

Card 1:
Q: What are the two ways to use configuration files with ESLint?
A: Configuration Files (JavaScript, JSON, or YAML files) and Configuration Comments (JavaScript comments embedded in source code).

Card 2:
Q: What are the three locations ESLint looks for configuration files?
A: Custom locations specified with the --config command line option, the current working directory, and the directory hierarchy up to the root directory.
```

## Next Steps

After successfully testing Claude's PDF capabilities, implement the changes in the main application:

1. Update `useDocumentUpload.ts` to handle PDF files
2. Modify `claude.ts` to send PDFs to Claude as multimodal content
3. Update `useFlashcardGeneration.ts` to support the new PDF content format
4. Enable the PDF support test in `tests/pdf-support.spec.ts`