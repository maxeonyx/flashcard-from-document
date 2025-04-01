<template>
  <div id="app">
    <header>
      <img alt="Vue logo" src="./assets/logo.png" class="logo">
      <h1>Flashcard From Document</h1>
    </header>

    <main>
      <ApiKeyInput />
      
      <DocumentUploader @flashcardsGenerated="onFlashcardsGenerated" />
      
      <FlashcardDisplay :initialSetId="latestSetId" />
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
import { ref, computed } from 'vue';
import ApiKeyInput from './features/api-key/ApiKeyInput.vue';
import DocumentUploader from './features/document-upload/DocumentUploader.vue';
import FlashcardDisplay from './features/flashcard-display/FlashcardDisplay.vue';
import { useVersion } from './composables/useVersion';
import type { FlashcardSet } from './types';

const latestSetId = ref('');
const { version: versionInfo } = useVersion();
const version = computed(() => versionInfo.value?.version || '0.0.0');

function onFlashcardsGenerated(newSet: FlashcardSet): void {
  latestSetId.value = newSet.id;
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