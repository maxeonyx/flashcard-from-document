import { ref } from 'vue';
import { ClaudeService, type DocumentUpload } from '../services/claude';
import { useFlashcards } from './useFlashcards';
import type { FlashcardSet } from '../types';

/**
 * Composable for generating flashcards from document content
 */
export function useFlashcardGeneration() {
  const isGenerating = ref(false);
  const error = ref('');
  
  const { addFlashcardSet } = useFlashcards();
  
  async function generateFlashcards(
    apiKey: string, 
    documentContent: string, 
    fileName: string,
    isPdf = false
  ): Promise<FlashcardSet | null> {
    if (!apiKey || !documentContent) {
      error.value = !apiKey 
        ? "Please set your Claude API key first" 
        : "Please upload a document first";
      return null;
    }

    error.value = '';
    isGenerating.value = true;
    
    try {
      const claudeService = new ClaudeService(apiKey);
      
      // Create document upload object based on file type
      const documentUpload: DocumentUpload = {
        fileName: fileName,
        ...(isPdf ? { pdfBase64: documentContent } : { text: documentContent })
      };
      
      const result = await claudeService.generateFlashcards(documentUpload);
      
      if (result.error) {
        error.value = result.error;
        return null;
      }
      
      if (result.cards.length === 0) {
        error.value = "No flashcards could be generated. Try a different document.";
        return null;
      }
      
      // Process the cards and add IDs and creation dates
      const flashcards = result.cards.map(card => ({
        id: crypto.randomUUID(),
        question: card.question,
        answer: card.answer,
        createdAt: new Date()
      }));
      
      // Save the flashcard set with the generated title or fallback to filename
      const newSet = addFlashcardSet({
        name: result.title || fileName || 'Untitled Set',
        cards: flashcards
      });
      
      return newSet;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An unknown error occurred';
      return null;
    } finally {
      isGenerating.value = false;
    }
  }
  
  return {
    isGenerating,
    error,
    generateFlashcards
  };
}