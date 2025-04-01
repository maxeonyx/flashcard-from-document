import { ref, onMounted } from 'vue';

export interface VersionInfo {
  version: string;
  name: string;
  buildTime: string;
}

export function useVersion() {
  const version = ref<VersionInfo | null>(null);
  const loading = ref(true);
  const error = ref<Error | null>(null);

  async function fetchVersion() {
    try {
      loading.value = true;
      error.value = null;
      
      // Use the base URL from the app
      const baseUrl = import.meta.env.BASE_URL || '/';
      const response = await fetch(`${baseUrl}version.json?t=${Date.now()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch version info: ${response.status} ${response.statusText}`);
      }
      
      version.value = await response.json();
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      console.error('Error fetching version:', err);
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => {
    fetchVersion();
  });

  return {
    version,
    loading,
    error,
    fetchVersion
  };
}