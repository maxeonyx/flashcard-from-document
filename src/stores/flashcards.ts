import { defineStore } from 'pinia';
import type { Flashcard, FlashcardSet } from '../types';

export const useFlashcardStore = defineStore('flashcards', {
  state: () => ({
    apiKey: localStorage.getItem('claude-api-key') || '',
    flashcardSets: JSON.parse(localStorage.getItem('flashcard-sets') || '[]') as FlashcardSet[],
  }),

  actions: {
    setApiKey(key: string) {
      this.apiKey = key;
      localStorage.setItem('claude-api-key', key);
    },

    addFlashcardSet(set: Omit<FlashcardSet, 'id' | 'createdAt'>) {
      const newSet: FlashcardSet = {
        ...set,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      };
      this.flashcardSets.push(newSet);
      this.saveToLocalStorage();
      return newSet;
    },

    deleteFlashcardSet(id: string) {
      this.flashcardSets = this.flashcardSets.filter(set => set.id !== id);
      this.saveToLocalStorage();
    },

    saveToLocalStorage() {
      localStorage.setItem('flashcard-sets', JSON.stringify(this.flashcardSets));
    },
  },
});