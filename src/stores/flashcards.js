import { defineStore } from 'pinia';

export const useFlashcardStore = defineStore('flashcards', {
  state: () => ({
    apiKey: localStorage.getItem('claude-api-key') || '',
    flashcardSets: JSON.parse(localStorage.getItem('flashcard-sets') || '[]'),
  }),

  actions: {
    setApiKey(key) {
      this.apiKey = key;
      localStorage.setItem('claude-api-key', key);
    },

    addFlashcardSet(set) {
      const newSet = {
        ...set,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      };
      this.flashcardSets.push(newSet);
      this.saveToLocalStorage();
      return newSet;
    },

    deleteFlashcardSet(id) {
      this.flashcardSets = this.flashcardSets.filter(set => set.id !== id);
      this.saveToLocalStorage();
    },

    saveToLocalStorage() {
      localStorage.setItem('flashcard-sets', JSON.stringify(this.flashcardSets));
    },
  },
});