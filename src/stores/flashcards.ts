import { defineStore } from 'pinia';
import type { FlashcardSet } from '../types';

/**
 * Simple central store for flashcard management
 * Provides a single source of truth for the application state
 */
export const useFlashcardStore = defineStore('flashcards', {
  state: () => {
    // Load initial state from localStorage
    let apiKey = '';
    let flashcardSets: FlashcardSet[] = [];
    
    try {
      // Read API key
      const storedKey = localStorage.getItem('claude-api-key');
      if (storedKey) apiKey = storedKey;
      
      // Read flashcard sets
      const storedSets = localStorage.getItem('flashcard-sets');
      if (storedSets) flashcardSets = JSON.parse(storedSets);
    } catch (e) {
      console.error('Error loading data from localStorage:', e);
    }
    
    return {
      apiKey,
      flashcardSets,
      selectedSetId: ''
    };
  },
  
  getters: {
    isApiKeySet: (state) => !!state.apiKey,
    selectedSet: (state) => state.flashcardSets.find(set => set.id === state.selectedSetId)
  },
  
  actions: {
    /**
     * Save state to localStorage
     */
    saveToLocalStorage() {
      try {
        localStorage.setItem('claude-api-key', this.apiKey);
        localStorage.setItem('flashcard-sets', JSON.stringify(this.flashcardSets));
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
    },
    
    /**
     * Set API key
     */
    setApiKey(key: string) {
      this.apiKey = key;
      this.saveToLocalStorage();
    },
    
    /**
     * Add a new flashcard set
     */
    addFlashcardSet(set: Omit<FlashcardSet, 'id' | 'createdAt'>): FlashcardSet {
      const newSet: FlashcardSet = {
        ...set,
        id: crypto.randomUUID(),
        createdAt: new Date()
      };
      
      this.flashcardSets.push(newSet);
      this.selectedSetId = newSet.id; 
      this.saveToLocalStorage();
      
      return newSet;
    },
    
    /**
     * Delete a flashcard set
     */
    deleteFlashcardSet(id: string) {
      // If deleting the selected set, select another if available
      if (this.selectedSetId === id) {
        const remainingSets = this.flashcardSets.filter(set => set.id !== id);
        this.selectedSetId = remainingSets.length > 0 ? remainingSets[0].id : '';
      }
      
      this.flashcardSets = this.flashcardSets.filter(set => set.id !== id);
      this.saveToLocalStorage();
    },
    
    /**
     * Select a flashcard set
     */
    selectSet(id: string) {
      this.selectedSetId = id;
    },
    
    /**
     * Update a flashcard
     */
    updateFlashcard(setId: string, cardId: string, question: string, answer: string) {
      const setIndex = this.flashcardSets.findIndex(set => set.id === setId);
      if (setIndex === -1) return;
      
      const cardIndex = this.flashcardSets[setIndex].cards.findIndex(card => card.id === cardId);
      if (cardIndex === -1) return;
      
      // Update the card
      this.flashcardSets[setIndex].cards[cardIndex].question = question;
      this.flashcardSets[setIndex].cards[cardIndex].answer = answer;
      
      this.saveToLocalStorage();
    },
    
    /**
     * Sync state from localStorage (for cross-tab support)
     */
    syncFromLocalStorage() {
      try {
        const storedSets = localStorage.getItem('flashcard-sets');
        if (storedSets) this.flashcardSets = JSON.parse(storedSets);
        
        const storedKey = localStorage.getItem('claude-api-key');
        if (storedKey) this.apiKey = storedKey;
      } catch (e) {
        console.error('Error syncing from localStorage:', e);
      }
    }
  }
});