import { ref, watchEffect } from 'vue';

/**
 * A composable for managing values in localStorage with reactive updates
 * @param key The localStorage key
 * @param defaultValue Default value if nothing exists in localStorage
 * @returns A reactive ref that syncs with localStorage
 */
export function useLocalStorage<T>(key: string, defaultValue: T) {
  // Create a reactive reference
  const storedValue = ref<T>(defaultValue);

  // Initialize with value from localStorage if available
  try {
    const value = localStorage.getItem(key);
    if (value !== null) {
      storedValue.value = JSON.parse(value);
    }
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
  }

  // Update localStorage when the value changes
  watchEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue.value));
    } catch (error) {
      console.error(`Error storing ${key} to localStorage:`, error);
    }
  });

  return storedValue;
}