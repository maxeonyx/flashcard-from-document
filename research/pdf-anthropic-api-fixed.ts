// Test script for Anthropic's native PDF support using actual PDF file
// Run with: ANTHROPIC_API_KEY=your_api_key tsx pdf-anthropic-api-fixed.ts

import { Anthropic } from '@anthropic-ai/sdk';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODEL = 'claude-3-5-sonnet-20241022';
const MAX_TOKENS = 8000;

/**
 * Main function to test Anthropic's PDF support with actual PDF file
 */
async function testAnthropicPdfSupport(): Promise<void> {
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

    // Path to PDF file
    const pdfPath = path.join(
      __dirname, 
      '../test-resources/Configuration Files - ESLint - Pluggable JavaScript Linter.pdf'
    );
    
    console.log(`Loading PDF from: ${pdfPath}`);
    
    // Read the PDF file into a buffer
    const pdfBuffer = await fs.readFile(pdfPath);
    
    // Convert to base64
    const pdfBase64 = pdfBuffer.toString('base64');
    
    console.log(`PDF loaded and converted to base64 (${pdfBase64.length} characters)`);
    
    // Create the message with PDF content
    console.log('Sending request to Claude API...');
    
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: 'user',
          content: [
            // First include the PDF as a document content block
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: pdfBase64
              }
            },
            // Then include the text prompt
            {
              type: 'text',
              text: `Create flashcards from this PDF document about ESLint configuration files. 

Your response must be valid JSON that I can parse with JSON.parse(). Respond with ONLY a JSON object containing a "title" string field and a "cards" array field that contains objects with "question" and "answer" fields like this:

{
  "title": "ESLint Configuration",
  "cards": [
    {
      "question": "What are configuration files used for in ESLint?",
      "answer": "The detailed explanation..."
    },
    {
      "question": "What are the different types of ESLint configuration files?",
      "answer": "The types are..."
    }
  ]
}

Create 8-10 flashcards covering the key concepts about ESLint configuration.`
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
        result.cards.forEach((card: any, index: number) => {
          console.log(`\nCard ${index + 1}:`);
          console.log(`Q: ${card.question}`);
          console.log(`A: ${card.answer}`);
        });
        
        // Save to a file for reference
        await fs.writeFile(
          path.join(__dirname, 'eslint-pdf-flashcards.json'),
          JSON.stringify(result, null, 2),
          'utf-8'
        );
        console.log('\nFlashcards saved to eslint-pdf-flashcards.json');
        
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
console.log('Starting test for Anthropic PDF support with actual PDF file...');
testAnthropicPdfSupport().catch(console.error);