// PDF test script using Claude's native PDF capabilities
// Run with: ANTHROPIC_API_KEY=your_api_key node --loader ts-node/esm pdf-test.ts

import { Anthropic } from '@anthropic-ai/sdk';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODEL = 'claude-3-5-sonnet-20241022';
const MAX_TOKENS = 8000;

interface FlashcardCard {
  question: string;
  answer: string;
}

interface FlashcardGenerationResult {
  title: string;
  cards: FlashcardCard[];
  error?: string;
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
    
    // Read the PDF file as a binary buffer
    const pdfBuffer = await fs.readFile(pdfPath);
    
    // Convert to base64
    const pdfBase64 = pdfBuffer.toString('base64');
    
    console.log(`PDF loaded and converted to base64 (${pdfBase64.length} characters)`);
    
    // Create the multimodal message with PDF content
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
              text: `Create flashcards from this PDF document. Extract the key concepts and create question-answer pairs.

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

The title should be concise (3-6 words) and descriptive of the document's content. Do not include any explanations, markdown formatting, or non-JSON text in your response.`
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: pdfBase64
              }
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
console.log('Starting PDF test...');
testPdfProcessing().catch(console.error);