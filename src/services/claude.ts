import Anthropic from '@anthropic-ai/sdk';

export interface FlashcardCard {
  question: string;
  answer: string;
}

export interface FlashcardGenerationResult {
  cards: FlashcardCard[];
  error?: string;
}

const MODEL = 'claude-3-sonnet-20240229';
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

IMPORTANT: Your entire response must be valid JSON that I can parse with JSON.parse(). Respond with ONLY a JSON array containing objects with "question" and "answer" fields like this:

[
  {
    "question": "What is...",
    "answer": "It is..."
  },
  {
    "question": "How does...",
    "answer": "It works by..."
  }
]

Do not include any explanations, markdown formatting, or non-JSON text in your response.

Document text:
${documentText}`,
          },
        ],
      });

      // Extract content text
      const contentBlock = response.content[0];
      if ('text' in contentBlock) {
        const content = contentBlock.text;
        
        // Add more robust JSON extraction
        // First try to find JSON array with standard regex
        const jsonMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
        
        if (jsonMatch) {
          try {
            const cards = JSON.parse(jsonMatch[0]) as FlashcardCard[];
            return { cards };
          } catch (parseError) {
            console.error('JSON parse error:', parseError);
            // Continue to other extraction attempts
          }
        }
        
        // If that fails, try to find JSON within markdown code blocks
        const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch && codeBlockMatch[1]) {
          try {
            const cards = JSON.parse(codeBlockMatch[1]) as FlashcardCard[];
            return { cards };
          } catch (parseError) {
            console.error('Code block JSON parse error:', parseError);
            // Continue to other extraction attempts
          }
        }
        
        // Last resort - try to extract any valid JSON array in the content
        try {
          // Look for array of objects pattern more liberally
          const matches = content.match(/\[[\s\S]*?\]/g);
          if (matches) {
            for (const match of matches) {
              try {
                const parsed = JSON.parse(match);
                if (Array.isArray(parsed) && parsed.length > 0 && 
                    parsed[0].question && parsed[0].answer) {
                  return { cards: parsed };
                }
              } catch (e) {
                // Try next match
              }
            }
          }
          
          return {
            cards: [],
            error: 'Could not extract valid flashcard JSON from Claude response.'
          };
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