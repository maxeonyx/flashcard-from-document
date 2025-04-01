// PDF text extraction test script - fixed version
// Run with: ANTHROPIC_API_KEY=your_api_key tsx pdf-text-extraction-fixed.ts

import { Anthropic } from '@anthropic-ai/sdk';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
// Use exec to run pdftotext command instead of the problematic pdf-parse library
import { exec } from 'child_process';
import { promisify } from 'util';

// Promisify exec
const execAsync = promisify(exec);

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODEL = 'claude-3-5-sonnet-20241022';
const MAX_TOKENS = 8000;

interface FlashcardCard {
  question: string;
  answer: string;
}

/**
 * Extract text from PDF using pdftotext (from poppler-utils)
 * This requires poppler-utils to be installed:
 * sudo apt-get install poppler-utils
 */
async function extractTextFromPdf(pdfPath: string): Promise<string> {
  try {
    console.log(`Extracting text from PDF using pdftotext: ${pdfPath}`);
    const { stdout } = await execAsync(`pdftotext "${pdfPath}" -`);
    return stdout;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    
    // Try an alternative approach - basic filesystem approach
    try {
      console.log('Falling back to manual file reading...');
      const fileBuffer = await fs.readFile(pdfPath);
      // Just extract text fragments (this is a very basic approach)
      const fileContent = fileBuffer.toString('utf-8');
      // Extract text fragments (this is not perfect but might work for text PDFs)
      const textFragments = fileContent.match(/\(([^)]+)\)/g) || [];
      return textFragments
        .map(fragment => fragment.substring(1, fragment.length - 1))
        .filter(text => /[a-zA-Z0-9]/.test(text))
        .join(' ');
    } catch (fallbackError) {
      console.error('Fallback extraction also failed:', fallbackError);
      throw new Error('Failed to extract text from PDF. Is poppler-utils installed?');
    }
  }
}

/**
 * Main function to test PDF processing with Claude
 */
async function testPdfProcessing(): Promise<void> {
  try {
    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('Error: ANTHROPIC_API_KEY environment variable is required');
      process.exit(1);
    }

    console.log('Initializing Claude client...');
    
    // Initialize Claude client
    const client = new Anthropic({
      apiKey,
    });

    // Path to test PDF
    const pdfPath = path.join(
      __dirname, 
      '../test-resources/Configuration Files - ESLint - Pluggable JavaScript Linter.pdf'
    );
    
    console.log(`Loading PDF from: ${pdfPath}`);
    
    // Extract text from PDF
    const pdfText = await extractTextFromPdf(pdfPath);
    
    console.log(`PDF text extracted (${pdfText.length} characters)`);
    console.log('First 300 characters of extracted text:');
    console.log('-'.repeat(50));
    console.log(pdfText.substring(0, 300));
    console.log('-'.repeat(50));
    
    // Create the message with extracted PDF text
    console.log('Sending request to Claude API...');
    
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Create flashcards from this PDF document text. Extract the key concepts and create question-answer pairs.

IMPORTANT: Your entire response must be valid JSON that I can parse with JSON.parse(). Respond with ONLY a JSON object containing a "title" string field and a "cards" array field that contains objects with "question" and "answer" fields like this:

{
  "title": "A descriptive title for this flashcard set",
  "cards": [
    {
      "question": "What is...",
      "answer": "It is..."
    },
    {
      "question": "How does...",
      "answer": "It works by..."
    }
  ]
}

The title should be concise (3-6 words) and descriptive of the document's content. Do not include any explanations, markdown formatting, or non-JSON text in your response.

Document text extracted from PDF:
${pdfText}`
            }
          ],
        },
      ],
    });

    console.log('Response received from Claude API!');
    
    // Extract content text
    const contentBlock = response.content[0];
    if ('text' in contentBlock) {
      console.log('\nRaw response text:');
      console.log('-------------------');
      console.log(contentBlock.text.substring(0, 500) + '...');
      console.log('-------------------');
      
      // Try to parse the JSON response
      try {
        const result = JSON.parse(contentBlock.text);
        console.log('\nParsed flashcards:');
        console.log(`Title: ${result.title}`);
        console.log(`Cards: ${result.cards.length}`);
        
        // Print out the flashcards
        console.log('\nFlashcards:');
        result.cards.forEach((card: FlashcardCard, index: number) => {
          console.log(`\nCard ${index + 1}:`);
          console.log(`Q: ${card.question}`);
          console.log(`A: ${card.answer}`);
        });
        
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        console.log('Full response:', contentBlock.text);
      }
    } else {
      console.error('No text content found in response');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the test
console.log('Starting PDF test with text extraction...');
testPdfProcessing().catch(console.error);