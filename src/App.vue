<template>
  <div id="app">
    <header>
      <img alt="Vue logo" src="./assets/logo.png" class="logo">
      <h1>Flashcard From Document</h1>
    </header>

    <main>
      <!-- API Key Setup Screen -->
      <div v-if="!isApiKeySet" class="onboarding-container">
        <h2>Welcome to Flashcard From Document</h2>
        <p>Please enter your Claude API key to get started</p>
        <ApiKeyInput @key-saved="refreshApiKeyStatus" />
      </div>
      
      <!-- Main Application -->
      <div v-else>
        <div class="api-key-status">
          <span class="api-key-badge">API Key: ✅</span>
          <button @click="showApiKeyInput = !showApiKeyInput" class="key-toggle-btn">
            {{ showApiKeyInput ? 'Hide' : 'Change API Key' }}
          </button>
        </div>
        
        <ApiKeyInput v-if="showApiKeyInput" />
        
        <DocumentUploader @flashcardsGenerated="onFlashcardsGenerated" />
        
        <FlashcardDisplay :initialSetId="latestSetId" />
      </div>
    </main>

    <footer>
      <p>Version {{ version }} - Powered by Anthropic's Claude API</p>
      <p v-if="versionInfo?.buildTime" class="build-time">
        Built: {{ new Date(versionInfo.buildTime).toLocaleString() }}
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import ApiKeyInput from './features/api-key/ApiKeyInput.vue';
import DocumentUploader from './features/document-upload/DocumentUploader.vue';
import FlashcardDisplay from './features/flashcard-display/FlashcardDisplay.vue';
import { useVersion } from './composables/useVersion';
import { useApiKey } from './composables/useApiKey';
import { useFlashcards } from './composables/useFlashcards';
import type { FlashcardSet } from './types';

const latestSetId = ref('');
const { version: versionInfo } = useVersion();
const version = computed(() => versionInfo.value?.version || '0.0.0');
const { isApiKeySet } = useApiKey();
const { flashcardSets } = useFlashcards();
const showApiKeyInput = ref(false);

// Watch for changes in flashcard sets to update the latest set ID
watch(flashcardSets, (sets) => {
  // If no set is selected but sets exist, select the first one
  if (sets.length > 0 && !latestSetId.value) {
    latestSetId.value = sets[0].id;
  }
}, { immediate: true });

function onFlashcardsGenerated(newSet: FlashcardSet): void {
  latestSetId.value = newSet.id;
}

function refreshApiKeyStatus(): void {
  // This function is called when an API key is saved
  // Just hide the API key input
  showApiKeyInput.value = false;
}
</script>

<style>
:root {
  --primary-color: #42b983;
  --primary-hover: #3aa876;
  --error-color: #e53935;
  --text-color: #2c3e50;
  --muted-text: #666;
  --border-color: #ddd;
  --bg-color: #f9f9f9;
}

html, body {
  margin: 0;
  padding: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-color);
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

header {
  text-align: center;
  margin: 20px 0;
}

.logo {
  width: 80px;
  height: 80px;
}

h1 {
  font-size: 28px;
  color: var(--primary-color);
}

main {
  margin-bottom: 50px;
}

.onboarding-container {
  max-width: 600px;
  margin: 40px auto;
  text-align: center;
  padding: 30px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: white;
}

.onboarding-container h2 {
  margin-bottom: 10px;
  color: var(--primary-color);
}

.onboarding-container p {
  margin-bottom: 30px;
  color: var(--muted-text);
}

.api-key-status {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 15px;
}

.api-key-badge {
  color: var(--primary-color);
  font-size: 14px;
  font-weight: 500;
  margin-right: 10px;
}

.key-toggle-btn {
  background-color: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-color);
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.key-toggle-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

footer {
  text-align: center;
  margin: 30px 0;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
  color: var(--muted-text);
  font-size: 14px;
}

footer p {
  margin: 5px 0;
}

footer .build-time {
  font-size: 12px;
  opacity: 0.8;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  #app {
    padding: 0 15px;
  }
  
  h1 {
    font-size: 24px;
  }
  
  .logo {
    width: 60px;
    height: 60px;
  }
}
</style>