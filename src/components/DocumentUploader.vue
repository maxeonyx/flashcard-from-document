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
        <p class="document-stats">{{ documentStats }}</p>
        <div class="document-content">
          {{ documentPreview }}
        </div>
        <div class="actions">
          <button @click="clearDocument" class="btn btn-secondary">Clear</button>
          <button @click="generateFlashcards" class="btn btn-primary" :disabled="!canGenerate || isGenerating">
            {{ isGenerating ? 'Generating...' : 'Generate Flashcards' }}
          </button>
        </div>
      </div>
    </div>
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useFlashcardStore } from '../stores/flashcards';
import { ClaudeService } from '../services/claude';
import type { FlashcardSet } from '../types';

const emit = defineEmits<{
  (e: 'flashcardsGenerated', newSet: FlashcardSet): void
}>();

const store = useFlashcardStore();
const documentContent = ref('');
const fileName = ref('');
const isHighlighted = ref(false);
const isGenerating = ref(false);
const error = ref('');

const documentPreview = computed(() => {
  if (!documentContent.value) return '';
  return documentContent.value.length > 500 
    ? documentContent.value.substring(0, 500) + '...' 
    : documentContent.value;
});

const documentStats = computed(() => {
  if (!documentContent.value) return '';
  
  const wordCount = documentContent.value.split(/\s+/).filter(Boolean).length;
  const charCount = documentContent.value.length;
  
  return `${wordCount} words, ${charCount} characters`;
});

const canGenerate = computed(() => {
  return !!store.apiKey && !!documentContent.value;
});

function highlightDrop(): void {
  isHighlighted.value = true;
}

function unhighlightDrop(): void {
  isHighlighted.value = false;
}

async function handleTextFile(file: File): Promise<void> {
  const text = await file.text();
  documentContent.value = text;
  fileName.value = file.name;
}

function handleDrop(e: DragEvent): void {
  unhighlightDrop();
  
  if (!e.dataTransfer?.files.length) return;
  
  const file = e.dataTransfer.files[0];
  processFile(file);
}

function handleFileSelect(e: Event): void {
  const target = e.target as HTMLInputElement;
  if (!target.files?.length) return;
  
  const file = target.files[0];
  processFile(file);
}

function processFile(file: File): void {
  const fileType = file.name.split('.').pop()?.toLowerCase();
  
  if (fileType === 'txt' || fileType === 'md') {
    handleTextFile(file);
  } else if (fileType === 'pdf') {
    error.value = "PDF parsing is not supported in this version. Please upload a text file.";
  } else {
    error.value = "Unsupported file format. Please upload a .txt or .md file.";
  }
}

function clearDocument(): void {
  documentContent.value = '';
  fileName.value = '';
  error.value = '';
}

async function generateFlashcards(): Promise<void> {
  if (!canGenerate.value) {
    error.value = !store.apiKey 
      ? "Please set your Claude API key first" 
      : "Please upload a document first";
    return;
  }

  error.value = '';
  isGenerating.value = true;
  
  try {
    const claudeService = new ClaudeService(store.apiKey);
    const result = await claudeService.generateFlashcards(documentContent.value);
    
    if (result.error) {
      error.value = result.error;
      return;
    }
    
    if (result.cards.length === 0) {
      error.value = "No flashcards could be generated. Try a different document.";
      return;
    }
    
    // Process the cards and add IDs and creation dates
    const flashcards = result.cards.map(card => ({
      id: crypto.randomUUID(),
      question: card.question,
      answer: card.answer,
      createdAt: new Date()
    }));
    
    // Save the flashcard set
    const newSet = store.addFlashcardSet({
      name: fileName.value || 'Untitled Set',
      cards: flashcards
    });
    
    // Emit event with the new set
    emit('flashcardsGenerated', newSet);
    
    // Clear the document input
    clearDocument();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An unknown error occurred';
  } finally {
    isGenerating.value = false;
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
}

.btn-primary {
  background-color: #42b983;
  color: white;
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
</style>