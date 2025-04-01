import { ref, watchEffect, onMounted, onUnmounted } from 'vue';

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
  const initializeFromStorage = () => {
    try {
      const value = localStorage.getItem(key);
      if (value !== null) {
        storedValue.value = JSON.parse(value);
      }
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
    }
  };

  // Initialize immediately
  if (typeof window !== 'undefined') {
    initializeFromStorage();
  }

  // Update localStorage when the value changes
  watchEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(storedValue.value));
      } catch (error) {
        console.error(`Error storing ${key} to localStorage:`, error);
      }
    }
  });

  // Handler function for storage events
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === key && event.newValue !== null) {
      try {
        storedValue.value = JSON.parse(event.newValue);
      } catch (error) {
        console.error(`Error parsing ${key} from localStorage event:`, error);
      }
    }
  };

  // Custom event for direct updates (within the same window)
  const handleCustomStorageChange = (e: CustomEvent) => {
    if (e.detail?.key === key) {
      try {
        storedValue.value = e.detail.value;
      } catch (error) {
        console.error(`Error handling custom storage event for ${key}:`, error);
      }
    }
  };

  // Add event listeners when component mounts
  if (typeof window !== 'undefined') {
    onMounted(() => {
      // Re-read from localStorage when mounting to ensure we have latest data
      initializeFromStorage();
      
      // Set up event listeners
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('localStorage-updated', handleCustomStorageChange as EventListener);
    });

    // Clean up event listeners when component unmounts
    onUnmounted(() => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorage-updated', handleCustomStorageChange as EventListener);
    });
  }

  return storedValue;
}