import { computed, ref } from 'vue';
import { useFlashcardStore } from '../stores/flashcards';

/**
 * Composable for managing the Claude API key
 * @returns Functions and reactive data for API key management
 */
export function useApiKey() {
  const store = useFlashcardStore();
  const inputKey = ref('');
  
  const isApiKeySet = computed(() => store.isApiKeySet);
  
  function saveApiKey(): void {
    if (inputKey.value.trim()) {
      store.setApiKey(inputKey.value.trim());
      inputKey.value = '';
    }
  }
  
  return {
    apiKey: computed(() => store.apiKey),
    inputKey,
    isApiKeySet,
    saveApiKey
  };
}