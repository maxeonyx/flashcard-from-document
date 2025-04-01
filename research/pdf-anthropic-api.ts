// Test script for Anthropic's native PDF support
// Run with: ANTHROPIC_API_KEY=your_api_key tsx pdf-anthropic-api.ts

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
 * Main function to test Anthropic's PDF support
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

    // Path to documentation about Anthropic's PDF support
    const docsPath = path.join(
      __dirname, 
      '../test-resources/anthropic_pdf.txt'
    );
    
    console.log(`Loading documentation from: ${docsPath}`);
    
    // Load the documentation
    const pdfDocs = await fs.readFile(docsPath, 'utf-8');
    
    console.log(`Documentation loaded (${pdfDocs.length} characters)`);
    
    // Create the message with documentation about PDF support
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
              text: `I'm implementing PDF support in my application using Claude's API. I have documentation about how Claude supports PDFs, and I want to create flashcards from this documentation.

Here is the documentation about Claude's PDF support:

${pdfDocs}

Based on this documentation, please create flashcards about Claude's PDF support capabilities. Your response must be valid JSON that I can parse with JSON.parse(). Respond with ONLY a JSON object containing a "title" string field and a "cards" array field that contains objects with "question" and "answer" fields like this:

{
  "title": "Claude PDF Support",
  "cards": [
    {
      "question": "How does Claude process PDFs?",
      "answer": "The detailed explanation..."
    },
    {
      "question": "What are the PDF requirements for Claude?",
      "answer": "The requirements are..."
    }
  ]
}

Make sure to cover the key aspects like how to send PDFs to Claude, the requirements, how it works internally, and best practices.`
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
          path.join(__dirname, 'anthropic-pdf-flashcards.json'),
          JSON.stringify(result, null, 2),
          'utf-8'
        );
        console.log('\nFlashcards saved to anthropic-pdf-flashcards.json');
        
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
console.log('Starting test for Anthropic PDF support...');
testAnthropicPdfSupport().catch(console.error);