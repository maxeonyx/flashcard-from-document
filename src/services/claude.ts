import Anthropic from '@anthropic-ai/sdk';

export interface FlashcardGenerationResult {
  cards: Array<{
    question: string;
    answer: string;
  }>;
  error?: string;
}

export class ClaudeService {
  private client: Anthropic | null = null;
  
  constructor(apiKey?: string) {
    if (apiKey) {
      this.initialize(apiKey);
    }
  }

  initialize(apiKey: string): void {
    this.client = new Anthropic({
      apiKey,
    });
  }

  async generateFlashcards(documentText: string): Promise<FlashcardGenerationResult> {
    if (!this.client) {
      return {
        cards: [],
        error: 'API key not set. Please set your Claude API key in the settings.'
      };
    }

    try {
      const response = await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 4000,
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

      const content = response.content[0].text;
      
      // Extract JSON from the response
      const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s);
      if (!jsonMatch) {
        return {
          cards: [],
          error: 'Could not parse flashcards from Claude response.'
        };
      }

      const cards = JSON.parse(jsonMatch[0]);
      return { cards };
    } catch (error) {
      console.error('Error generating flashcards:', error);
      return {
        cards: [],
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}