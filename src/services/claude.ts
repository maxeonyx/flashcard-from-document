import Anthropic from '@anthropic-ai/sdk';

export interface FlashcardCard {
  question: string;
  answer: string;
}

export interface FlashcardGenerationResult {
  cards: FlashcardCard[];
  error?: string;
}

const MODEL = 'claude-3-haiku-20240307';
const MAX_TOKENS = 4000;

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
   * Generate flashcards from document text
   */
  async generateFlashcards(documentText: string): Promise<FlashcardGenerationResult> {
    if (!this.client) {
      return {
        cards: [],
        error: 'API key not set. Please set your Claude API key in the settings.'
      };
    }

    try {
      const response = await this.client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [
          {
            role: 'user',
            content: `Create flashcards from this document text. Extract the key concepts and create question-answer pairs.
            Format your response as a valid JSON array with objects containing "question" and "answer" fields.
            
            Document text:
            ${documentText}`,
          },
        ],
      });

      // Extract content text
      const contentBlock = response.content[0];
      if ('text' in contentBlock) {
        const content = contentBlock.text;
        
        // Extract JSON from the response
        const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s);
        if (!jsonMatch) {
          return {
            cards: [],
            error: 'Could not parse flashcards from Claude response.'
          };
        }

        try {
          const cards = JSON.parse(jsonMatch[0]) as FlashcardCard[];
          return { cards };
        } catch (parseError) {
          return {
            cards: [],
            error: 'Failed to parse JSON from Claude response.'
          };
        }
      } else {
        return {
          cards: [],
          error: 'Could not extract text from Claude response.'
        };
      }
    } catch (error) {
      // Avoid console.error in production
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        cards: [],
        error: `Error: ${errorMessage}`
      };
    }
  }
}