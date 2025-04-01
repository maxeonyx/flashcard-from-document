import { computed, ref } from 'vue';
import { useLocalStorage } from './useLocalStorage';
import type { Flashcard, FlashcardSet } from '../types';

/**
 * Composable for managing flashcard sets
 * @returns Functions and reactive data for flashcard management
 */
export function useFlashcards() {
  const flashcardSets = useLocalStorage<FlashcardSet[]>('flashcard-sets', []);
  const selectedSetId = ref<string>('');
  const currentCardIndex = ref<number>(0);
  const isFlipped = ref<boolean>(false);
  
  const selectedSet = computed((): FlashcardSet | undefined => {
    if (!selectedSetId.value) return undefined;
    return flashcardSets.value.find(set => set.id === selectedSetId.value);
  });
  
  const currentCard = computed((): Flashcard | undefined => {
    if (!selectedSet.value || !selectedSet.value.cards.length) return undefined;
    return selectedSet.value.cards[currentCardIndex.value];
  });
  
  function selectSet(id: string): void {
    selectedSetId.value = id;
    currentCardIndex.value = 0;
    isFlipped.value = false;
  }
  
  function addFlashcardSet(set: Omit<FlashcardSet, 'id' | 'createdAt'>): FlashcardSet {
    const newSet: FlashcardSet = {
      ...set,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    
    flashcardSets.value = [...flashcardSets.value, newSet];
    // Automatically select the newly created set
    selectSet(newSet.id);
    
    // Dispatch a custom event to notify all components about the localStorage change
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('localStorage-updated', {
        detail: {
          key: 'flashcard-sets',
          value: flashcardSets.value
        }
      }));
    }
    
    return newSet;
  }
  
  function deleteFlashcardSet(id: string): void {
    if (selectedSetId.value === id) {
      // If deleting the currently selected set, select another one
      const remainingSets = flashcardSets.value.filter(set => set.id !== id);
      selectedSetId.value = remainingSets.length > 0 ? remainingSets[0].id : '';
      currentCardIndex.value = 0;
      isFlipped.value = false;
    }
    
    flashcardSets.value = flashcardSets.value.filter(set => set.id !== id);
    
    // Dispatch a custom event to notify all components about the localStorage change
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('localStorage-updated', {
        detail: {
          key: 'flashcard-sets',
          value: flashcardSets.value
        }
      }));
    }
  }
  
  function updateFlashcard(setId: string, cardId: string, question: string, answer: string): void {
    const setIndex = flashcardSets.value.findIndex(set => set.id === setId);
    if (setIndex === -1) return;
    
    const cardIndex = flashcardSets.value[setIndex].cards.findIndex(card => card.id === cardId);
    if (cardIndex === -1) return;
    
    // Create a deep copy of the flashcard sets
    const updatedSets = [...flashcardSets.value];
    
    // Update the specific card
    updatedSets[setIndex] = {
      ...updatedSets[setIndex],
      cards: [...updatedSets[setIndex].cards]
    };
    
    updatedSets[setIndex].cards[cardIndex] = {
      ...updatedSets[setIndex].cards[cardIndex],
      question,
      answer
    };
    
    // Update the state
    flashcardSets.value = updatedSets;
    
    // Dispatch a custom event to notify all components about the localStorage change
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('localStorage-updated', {
        detail: {
          key: 'flashcard-sets',
          value: flashcardSets.value
        }
      }));
    }
  }
  
  function prevCard(): void {
    if (currentCardIndex.value > 0) {
      currentCardIndex.value--;
      isFlipped.value = false;
    }
  }
  
  function nextCard(): void {
    if (selectedSet.value && currentCardIndex.value < selectedSet.value.cards.length - 1) {
      currentCardIndex.value++;
      isFlipped.value = false;
    }
  }
  
  function flipCard(): void {
    isFlipped.value = !isFlipped.value;
  }
  
  function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }
  
  return {
    flashcardSets,
    selectedSetId,
    currentCardIndex,
    isFlipped,
    selectedSet,
    currentCard,
    
    selectSet,
    addFlashcardSet,
    deleteFlashcardSet,
    updateFlashcard,
    prevCard,
    nextCard,
    flipCard,
    formatDate
  };
}