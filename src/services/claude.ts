import Anthropic from '@anthropic-ai/sdk';

export interface FlashcardCard {
  question: string;
  answer: string;
}

export interface FlashcardGenerationResult {
  title: string;
  cards: FlashcardCard[];
  error?: string;
}

export interface DocumentUpload {
  text?: string;
  pdfBase64?: string;
  fileName: string;
}

const MODEL = 'claude-3-5-sonnet-20241022';
const MAX_TOKENS = 8000;

/**
 * Service for interacting with Claude API
 */
export class ClaudeService {
  private client: Anthropic | null = null;
  
  constructor(apiKey?: string) {
    if (apiKey) {
      this.initialize(apiKey);
    }
  }

  /**
   * Initialize the Claude client with an API key
   */
  initialize(apiKey: string): void {
    this.client = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  }

  /**
   * Generate flashcards from document text or PDF
   */
  async generateFlashcards(document: DocumentUpload): Promise<FlashcardGenerationResult> {
    if (!this.client) {
      return {
        title: '',
        cards: [],
        error: 'API key not set. Please set your Claude API key in the settings.'
      };
    }

    try {
      // Prepare message content - this will vary based on input type
      const messageContent: Array<Anthropic.ContentBlock> = [];
      
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
      
      // Add the text prompt - always added after PDF content if present
      messageContent.push({
        type: 'text',
        text: `Create flashcards from this ${document.pdfBase64 ? 'PDF document' : 'document text'}. Extract the key concepts and create question-answer pairs.

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

The title should be concise (3-6 words) and descriptive of the document's content. Do not include any explanations, markdown formatting, or non-JSON text in your response.${
          document.text && !document.pdfBase64 ? `\n\nDocument text:\n${document.text}` : ''
        }`
      });
      
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

      // Extract content text
      const contentBlock = response.content[0];
      if ('text' in contentBlock) {
        const content = contentBlock.text;
        
        // First try direct JSON parsing - this should work with the new model
        try {
          const result = JSON.parse(content);
          // New format with title and cards
          if (typeof result === 'object' && result !== null && 
              'title' in result && 'cards' in result && 
              Array.isArray(result.cards) && result.cards.length > 0 && 
              'question' in result.cards[0] && 'answer' in result.cards[0]) {
            return { 
              title: result.title,
              cards: result.cards
            };
          }
          // Legacy format with just an array of cards
          else if (Array.isArray(result) && result.length > 0 && 
              'question' in result[0] && 'answer' in result[0]) {
            return { 
              title: 'Untitled Flashcard Set',
              cards: result 
            };
          }
        } catch (directParseError) {
          console.error('Direct JSON parse error:', directParseError);
          // Continue to other extraction attempts if direct parsing fails
        }
        
        // Try to find JSON object with title and cards
        const objectMatch = content.match(/\{[\s\S]*"title"[\s\S]*"cards"[\s\S]*\}/);
        if (objectMatch) {
          try {
            const result = JSON.parse(objectMatch[0]);
            if (typeof result === 'object' && result !== null && 
                'title' in result && 'cards' in result && 
                Array.isArray(result.cards)) {
              return { 
                title: result.title,
                cards: result.cards
              };
            }
          } catch (parseError) {
            console.error('JSON object parse error:', parseError);
            // Continue to other extraction attempts
          }
        }
        
        // Try to find JSON array with standard regex (legacy format)
        const jsonMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
          try {
            const cards = JSON.parse(jsonMatch[0]) as FlashcardCard[];
            return { 
              title: 'Untitled Flashcard Set',
              cards 
            };
          } catch (parseError) {
            console.error('JSON parse error:', parseError);
            // Continue to other extraction attempts
          }
        }
        
        // If that fails, try to find JSON within markdown code blocks
        const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch && codeBlockMatch[1]) {
          try {
            const result = JSON.parse(codeBlockMatch[1]);
            // Check if it's the new format with title and cards
            if (typeof result === 'object' && result !== null && 
                'title' in result && 'cards' in result && 
                Array.isArray(result.cards)) {
              return { 
                title: result.title,
                cards: result.cards
              };
            }
            // Legacy format with just an array of cards
            else if (Array.isArray(result) && result.length > 0 && 
                'question' in result[0] && 'answer' in result[0]) {
              return { 
                title: 'Untitled Flashcard Set',
                cards: result 
              };
            }
          } catch (parseError) {
            console.error('Code block JSON parse error:', parseError);
            // Continue to other extraction attempts
          }
        }
        
        // Last resort - try to extract any valid JSON array in the content (legacy format)
        try {
          // Look for array of objects pattern more liberally
          const matches = content.match(/\[[\s\S]*?\]/g);
          if (matches) {
            for (const match of matches) {
              try {
                const parsed = JSON.parse(match);
                if (Array.isArray(parsed) && parsed.length > 0 && 
                    'question' in parsed[0] && 'answer' in parsed[0]) {
                  return { 
                    title: 'Untitled Flashcard Set',
                    cards: parsed 
                  };
                }
              } catch (e) {
                // Try next match
              }
            }
          }
          
          return {
            title: '',
            cards: [],
            error: 'Could not extract valid flashcard JSON from Claude response.'
          };
        } catch (parseError) {
          return {
            title: '',
            cards: [],
            error: 'Failed to parse JSON from Claude response.'
          };
        }
      } else {
        return {
          title: '',
          cards: [],
          error: 'Could not extract text from Claude response.'
        };
      }
    } catch (error) {
      // Avoid console.error in production
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        title: '',
        cards: [],
        error: `Error: ${errorMessage}`
      };
    }
  }
}