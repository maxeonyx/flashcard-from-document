import { computed, ref, onMounted } from 'vue';
import { useFlashcardStore } from '../stores/flashcards';
import type { Flashcard, FlashcardSet } from '../types';

/**
 * Composable for managing flashcard sets
 * @returns Functions and reactive data for flashcard management
 */
export function useFlashcards() {
  // Use the centralized Pinia store
  const store = useFlashcardStore();
  
  // Local component state
  const currentCardIndex = ref<number>(0);
  const isFlipped = ref<boolean>(false);
  
  // Set up the storage event listener for cross-tab sync
  onMounted(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'flashcard-sets' || e.key === 'claude-api-key') {
        store.syncFromLocalStorage();
      }
    };
    
    // Add listener for storage events
    addEventListener('storage', handleStorageEvent);
    
    // Initialize selection if needed
    if (store.flashcardSets.length > 0 && !store.selectedSetId) {
      store.selectSet(store.flashcardSets[0].id);
    }
    
    // Return cleanup function
    return () => {
      removeEventListener('storage', handleStorageEvent);
    };
  });
  
  // Computed property for the currently selected flashcard
  const currentCard = computed((): Flashcard | undefined => {
    if (!store.selectedSet || !store.selectedSet.cards.length) return undefined;
    return store.selectedSet.cards[currentCardIndex.value];
  });
  
  // Select a flashcard set and reset card navigation
  function selectSet(id: string): void {
    store.selectSet(id);
    currentCardIndex.value = 0;
    isFlipped.value = false;
  }
  
  // Add a new flashcard set
  function addFlashcardSet(set: Omit<FlashcardSet, 'id' | 'createdAt'>): FlashcardSet {
    const newSet = store.addFlashcardSet(set);
    // Reset UI state for the new set
    currentCardIndex.value = 0;
    isFlipped.value = false;
    return newSet;
  }
  
  // Navigate to previous card
  function prevCard(): void {
    if (currentCardIndex.value > 0) {
      currentCardIndex.value--;
      isFlipped.value = false;
    }
  }
  
  // Navigate to next card
  function nextCard(): void {
    if (store.selectedSet && currentCardIndex.value < store.selectedSet.cards.length - 1) {
      currentCardIndex.value++;
      isFlipped.value = false;
    }
  }
  
  // Flip the current card
  function flipCard(): void {
    isFlipped.value = !isFlipped.value;
  }
  
  // Format a date for display
  function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }
  
  return {
    // State from the store
    flashcardSets: computed(() => store.flashcardSets),
    selectedSetId: computed({
      get: () => store.selectedSetId,
      set: (id) => store.selectSet(id)
    }),
    selectedSet: computed(() => store.selectedSet),
    
    // Local state
    currentCardIndex,
    isFlipped,
    currentCard,
    
    // Methods that combine store actions with local state
    selectSet,
    addFlashcardSet,
    deleteFlashcardSet: store.deleteFlashcardSet,
    updateFlashcard: store.updateFlashcard,
    prevCard,
    nextCard,
    flipCard,
    formatDate
  };
}