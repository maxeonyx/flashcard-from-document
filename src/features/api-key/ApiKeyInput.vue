<template>
  <div class="api-key-input">
    <h2>Claude API Key</h2>
    <div class="input-group">
      <input 
        type="password" 
        v-model="inputKey" 
        placeholder="Enter your Claude API key"
        class="form-control"
        @keyup.enter="saveAndEmit"
      />
      <button @click="saveAndEmit" class="btn">Save Key</button>
    </div>
    <p class="key-status" :class="{ 'key-set': isApiKeySet }">
      {{ isApiKeySet ? 'API key is set ✅' : 'No API key set' }}
    </p>
    <p class="key-info">
      Your API key is stored locally in your browser and is never sent to our servers.
    </p>
  </div>
</template>

<script setup lang="ts">
import { useApiKey } from '../../composables/useApiKey';

const emit = defineEmits(['key-saved']);
const { inputKey, isApiKeySet, saveApiKey } = useApiKey();

function saveAndEmit(): void {
  if (inputKey.value.trim()) {
    saveApiKey();
    emit('key-saved');
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
  transition: background-color 0.2s ease;
}

.btn:hover {
  background-color: #3aa876;
}

.key-status {
  font-size: 14px;
  margin-top: 8px;
}

.key-set {
  color: #42b983;
}

.key-info {
  font-size: 13px;
  color: #666;
  margin-top: 12px;
  font-style: italic;
}
</style>