import { computed, ref } from 'vue';
import { useLocalStorage } from './useLocalStorage';

/**
 * Composable for managing the Claude API key
 * @returns Functions and reactive data for API key management
 */
export function useApiKey() {
  const apiKey = useLocalStorage<string>('claude-api-key', '');
  const inputKey = ref('');
  
  const isApiKeySet = computed(() => !!apiKey.value);
  
  function saveApiKey(): void {
    if (inputKey.value.trim()) {
      apiKey.value = inputKey.value.trim();
      inputKey.value = '';
    }
  }
  
  return {
    apiKey,
    inputKey,
    isApiKeySet,
    saveApiKey
  };
}