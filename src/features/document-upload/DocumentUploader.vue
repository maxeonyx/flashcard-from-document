<template>
  <div class="document-uploader">
    <h2>Upload Document</h2>
    <div 
      class="upload-area" 
      @dragover.prevent="highlightDrop"
      @dragleave.prevent="unhighlightDrop"
      @drop.prevent="handleDrop"
      :class="{ 'highlight': isHighlighted }"
    >
      <div v-if="!documentContent">
        <p>Drag and drop your document here</p>
        <p>OR</p>
        <input 
          type="file" 
          id="file-upload" 
          @change="handleFileSelect" 
          accept=".txt,.md,.pdf"
          class="file-input"
        />
        <label for="file-upload" class="file-label">Select a file</label>
      </div>
      <div v-else class="document-preview">
        <h3>{{ fileName }}</h3>
        <p class="document-stats">{{ formattedStats }}</p>
        <div class="document-content">
          {{ documentPreview }}
        </div>
        <div class="actions">
          <button @click="clearDocument" class="btn btn-secondary">Clear</button>
          <button 
            @click="onGenerateFlashcards" 
            class="btn btn-primary" 
            :disabled="!canGenerate || isGenerating"
          >
            <span v-if="isGenerating" class="loading-spinner"></span>
            {{ isGenerating ? 'Generating...' : 'Generate Flashcards' }}
          </button>
        </div>
      </div>
    </div>
    <div v-if="generationError || uploadError" class="error-message">
      {{ generationError || uploadError }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDocumentUpload } from '../../composables/useDocumentUpload';
import { useFlashcardGeneration } from '../../composables/useFlashcardGeneration';
import { useApiKey } from '../../composables/useApiKey';
import type { FlashcardSet } from '../../types';

const emit = defineEmits<{
  (e: 'flashcardsGenerated', newSet: FlashcardSet): void
}>();

// Use our composables
const { apiKey } = useApiKey();

const { 
  documentContent, 
  fileName, 
  isHighlighted, 
  error: uploadError, 
  documentPreview, 
  formattedStats,
  highlightDrop,
  unhighlightDrop, 
  handleDrop, 
  handleFileSelect, 
  clearDocument 
} = useDocumentUpload();

const { 
  isGenerating, 
  error: generationError, 
  generateFlashcards 
} = useFlashcardGeneration();

// Computed for button states
const canGenerate = computed(() => {
  return !!apiKey.value && !!documentContent.value;
});

// Handler for the generate button
async function onGenerateFlashcards(): Promise<void> {
  const newSet = await generateFlashcards(
    apiKey.value, 
    documentContent.value, 
    fileName.value
  );
  
  if (newSet) {
    emit('flashcardsGenerated', newSet);
    clearDocument();
  }
}
</script>

<style scoped>
.document-uploader {
  margin: 20px 0;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  transition: all 0.3s ease;
  background-color: #f9f9f9;
  min-height: 200px;
}

.highlight {
  border-color: #42b983;
  background-color: rgba(66, 185, 131, 0.1);
}

.file-input {
  display: none;
}

.file-label {
  background-color: #42b983;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  display: inline-block;
  margin-top: 10px;
  transition: background-color 0.2s ease;
}

.file-label:hover {
  background-color: #3aa876;
}

.document-preview {
  text-align: left;
}

.document-stats {
  color: #666;
  font-size: 14px;
}

.document-content {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  margin: 10px 0;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 14px;
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #42b983;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary:hover:not([disabled]) {
  background-color: #3aa876;
}

.btn-primary[disabled] {
  background-color: #a0d9c4;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f2f2f2;
  color: #333;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

.error-message {
  color: #e53935;
  margin-top: 10px;
  padding: 10px;
  border-radius: 4px;
  background-color: rgba(229, 57, 53, 0.1);
  border: 1px solid rgba(229, 57, 53, 0.3);
}

/* Loading spinner */
.loading-spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>