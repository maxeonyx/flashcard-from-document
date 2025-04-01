import Anthropic from '@anthropic-ai/sdk';

export class ClaudeService {
  constructor(apiKey) {
    this.client = null;
    if (apiKey) {
      this.initialize(apiKey);
    }
  }

  initialize(apiKey) {
    this.client = new Anthropic({
      apiKey,
    });
  }

  async generateFlashcards(documentText) {
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

        const cards = JSON.parse(jsonMatch[0]);
        return { cards };
      } else {
        return {
          cards: [],
          error: 'Could not extract text from Claude response.'
        };
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      return {
        cards: [],
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}