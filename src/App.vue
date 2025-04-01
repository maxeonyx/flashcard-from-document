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
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ApiKeyInput from './components/ApiKeyInput.vue';
import DocumentUploader from './components/DocumentUploader.vue';
import FlashcardDisplay from './components/FlashcardDisplay.vue';
import pkg from '../package.json';
import type { FlashcardSet } from './types';

const latestSetId = ref('');
const version = ref(pkg.version);

function onFlashcardsGenerated(newSet: FlashcardSet) {
  latestSetId.value = newSet.id;
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
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
  color: #42b983;
}

main {
  margin-bottom: 50px;
}

footer {
  text-align: center;
  margin: 30px 0;
  padding-top: 20px;
  border-top: 1px solid #eee;
  color: #999;
  font-size: 14px;
}
</style>