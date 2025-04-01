<template>
  <div class="api-key-input">
    <h2>Claude API Key</h2>
    <div class="input-group">
      <input 
        type="password" 
        v-model="inputKey" 
        placeholder="Enter your Claude API key"
        class="form-control"
      />
      <button @click="saveApiKey" class="btn">Save Key</button>
    </div>
    <p v-if="apiKey" class="key-status">API key is set ✅</p>
    <p v-else class="key-status">No API key set</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useFlashcardStore } from '../stores/flashcards';

const store = useFlashcardStore();
const inputKey = ref('');

const apiKey = computed(() => store.apiKey);

function saveApiKey(): void {
  if (inputKey.value.trim()) {
    store.setApiKey(inputKey.value.trim());
    inputKey.value = '';
  }
}
</script>

<style scoped>
.api-key-input {
  margin: 20px 0;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.input-group {
  display: flex;
  margin: 10px 0;
}

input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px 0 0 4px;
  font-size: 16px;
}

.btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  font-size: 16px;
}

.btn:hover {
  background-color: #3aa876;
}

.key-status {
  font-size: 14px;
  margin-top: 8px;
}
</style>