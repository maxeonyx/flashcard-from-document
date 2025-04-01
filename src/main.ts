import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { useFlashcardStore } from './stores/flashcards';

// Create Vue app instance
const app = createApp(App);

// Set up Pinia for state management
const pinia = createPinia();
app.use(pinia);

// Make the store available globally for tests
// This is only needed for backward compatibility with tests
if (typeof window !== 'undefined' && !window.__FLASHCARD_STORE_INITIALIZED) {
  window.__FLASHCARD_STORE_INITIALIZED = true;
  
  // Initial store setup - since useFlashcardStore requires a Pinia instance,
  // we need to wait until after pinia is installed
  setTimeout(() => {
    const store = useFlashcardStore();
    
    // Expose store for tests
    window.__flashcardStore = store;
    window.__flashcardMethods = {
      addFlashcardSet: (set) => store.addFlashcardSet(set),
      deleteFlashcardSet: (id) => store.deleteFlashcardSet(id),
      selectSet: (id) => store.selectSet(id),
      updateFlashcard: (setId, cardId, question, answer) => 
        store.updateFlashcard(setId, cardId, question, answer)
    };
  }, 0);
}

// Mount the app
app.mount('#app');