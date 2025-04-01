<template>
  <div class="flashcard-display">
    <!-- No flashcards state -->
    <div v-if="!flashcardSets.length" class="no-flashcards">
      <h2>No Flashcard Sets</h2>
      <p>Upload a document to generate flashcards</p>
    </div>
    
    <!-- With flashcards state -->
    <div v-else>
      <h2>Your Flashcard Sets</h2>
      
      <!-- Flashcard set selector -->
      <div class="set-selector">
        <div 
          v-for="set in flashcardSets" 
          :key="set.id" 
          class="set-item"
          :class="{ active: selectedSetId === set.id }"
          @click="selectSet(set.id)"
        >
          <div class="set-info">
            <h3>{{ set.name }}</h3>
            <p>{{ set.cards.length }} cards • {{ formatDate(set.createdAt) }}</p>
          </div>
          <button 
            @click.stop="deleteSet(set.id)" 
            class="delete-btn" 
            title="Delete this set"
            aria-label="Delete flashcard set"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Flashcard viewer -->
      <div v-if="selectedSet" class="flashcard-viewer">
        <h3>{{ selectedSet.name }}</h3>
        
        <div class="flashcard-navigation">
          <button 
            @click="prevCard" 
            class="nav-btn" 
            :disabled="currentCardIndex === 0"
            aria-label="Previous flashcard"
          >
            ←
          </button>
          
          <div class="card-progress">
            Card {{ currentCardIndex + 1 }} of {{ selectedSet.cards.length }}
          </div>
          
          <button 
            @click="nextCard" 
            class="nav-btn" 
            :disabled="currentCardIndex === selectedSet.cards.length - 1"
            aria-label="Next flashcard"
          >
            →
          </button>
        </div>
        
        <!-- Flashcard with flip animation -->
        <div 
          class="flashcard" 
          @click="flipCard"
          role="button"
          tabindex="0"
          @keyup.space="flipCard"
          aria-label="Click to flip flashcard"
        >
          <div class="card-content" :class="{ flipped: isFlipped }">
            <div class="card-front">
              <p>{{ currentCard?.question }}</p>
              <button 
                @click.stop="editCard" 
                class="edit-btn" 
                title="Edit this flashcard"
                aria-label="Edit flashcard"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
            </div>
            <div class="card-back">
              <p v-html="formattedAnswer"></p>
              <button 
                @click.stop="editCard" 
                class="edit-btn" 
                title="Edit this flashcard"
                aria-label="Edit flashcard"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
            </div>
          </div>
          <p class="flip-instruction">Click to flip</p>
        </div>
        
        <!-- Edit flashcard modal -->
        <div v-if="isEditModalOpen" class="edit-modal">
          <div class="edit-modal-content">
            <h3>Edit Flashcard</h3>
            <div class="form-group">
              <label for="question">Question</label>
              <textarea id="question" v-model="editingCard.question" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label for="answer">Answer</label>
              <textarea id="answer" v-model="editingCard.answer" rows="5"></textarea>
            </div>
            <div class="modal-actions">
              <button class="btn-cancel" @click="cancelEdit">Cancel</button>
              <button class="btn-save" @click="saveEdit">Save</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { useFlashcards } from '../../composables/useFlashcards';
import type { Flashcard } from '../../types';

const props = defineProps({
  initialSetId: {
    type: String,
    default: ''
  }
});

const { 
  flashcardSets,
  selectedSetId,
  currentCardIndex,
  isFlipped,
  selectedSet,
  currentCard,
  
  selectSet,
  deleteFlashcardSet: deleteSet,
  prevCard,
  nextCard,
  flipCard,
  formatDate,
  updateFlashcard
} = useFlashcards();

const isEditModalOpen = ref(false);
const editingCard = ref<Partial<Flashcard>>({
  question: '',
  answer: ''
});

// Watch for initialSetId changes from parent
watch(() => props.initialSetId, (newId) => {
  if (newId && flashcardSets.value.find(set => set.id === newId)) {
    selectSet(newId);
  }
}, { immediate: true });

// Format answer text with line breaks
const formattedAnswer = computed(() => {
  if (!currentCard.value?.answer) return '';
  return currentCard.value.answer
    .replace(/\n/g, '<br>')
    .replace(/\d+\./g, '<br>$&')
    .replace(/;/g, ';<br>')
    .replace(/\. /g, '.<br>');
});

// Initialize with first set if available and none selected
watch(flashcardSets, (newSets) => {
  console.log('FlashcardDisplay: flashcardSets changed, length:', newSets.length);
  if (newSets.length > 0 && !selectedSetId.value) {
    console.log('FlashcardDisplay: Selecting first set:', newSets[0].id);
    selectSet(newSets[0].id);
  }
}, { immediate: true, deep: true });

// Make sure we have a selected set when we mount
onMounted(() => {
  // Always initialize with a selected set if available
  if (flashcardSets.value.length > 0 && !selectedSetId.value) {
    console.log('FlashcardDisplay mounted: selecting first set');
    selectSet(flashcardSets.value[0].id);
  }
});

function editCard(event: Event): void {
  event.stopPropagation();
  if (currentCard.value) {
    editingCard.value = {
      id: currentCard.value.id,
      question: currentCard.value.question,
      answer: currentCard.value.answer
    };
    isEditModalOpen.value = true;
  }
}

function saveEdit(): void {
  if (currentCard.value && editingCard.value.id && 
      selectedSet.value && typeof editingCard.value.question === 'string' && 
      typeof editingCard.value.answer === 'string') {
    updateFlashcard(
      selectedSet.value.id,
      editingCard.value.id,
      editingCard.value.question,
      editingCard.value.answer
    );
    isEditModalOpen.value = false;
  }
}

function cancelEdit(): void {
  isEditModalOpen.value = false;
}
</script>

<style scoped>
.flashcard-display {
  margin: 20px auto;
  max-width: 900px;
}

.no-flashcards {
  text-align: center;
  padding: 40px 0;
  color: #666;
}

.set-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.set-item {
  flex: 1;
  min-width: 200px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.set-item:hover {
  border-color: #42b983;
  background-color: rgba(66, 185, 131, 0.05);
}

.set-item.active {
  border-color: #42b983;
  background-color: rgba(66, 185, 131, 0.1);
}

.set-info {
  flex: 1;
}

.set-info h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
}

.set-info p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.delete-btn {
  background-color: transparent;
  border: none;
  color: #999;
  font-size: 18px;
  cursor: pointer;
  width: 30px;
  height: 30px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background-color: #f2f2f2;
  color: #e53935;
}

.flashcard-viewer {
  margin-top: 30px;
  text-align: center;
}

.flashcard-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px 0;
}

.nav-btn {
  background-color: #42b983;
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn:hover:not([disabled]) {
  background-color: #3aa876;
  transform: scale(1.05);
}

.nav-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.card-progress {
  font-size: 14px;
  color: #666;
}

.flashcard {
  width: 100%;
  height: 300px;
  perspective: 1000px;
  cursor: pointer;
  margin: 0 auto;
  max-width: 600px;
}

.card-content {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  border-radius: 10px;
}

.card-content.flipped {
  transform: rotateY(180deg);
}

.card-front, .card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border-radius: 10px;
  overflow-y: auto;
}

.card-front {
  background-color: #fff;
  border: 1px solid #ddd;
}

.card-back {
  background-color: #42b983;
  color: white;
  transform: rotateY(180deg);
}

.card-front p, .card-back p {
  font-size: 18px;
  line-height: 1.6;
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flip-instruction {
  font-size: 13px;
  color: #999;
  margin-top: 10px;
}

.edit-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: transparent;
  border: none;
  color: #999;
  padding: 5px;
  cursor: pointer;
  border-radius: 50%;
  opacity: 0.6;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  opacity: 1;
}

.edit-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.edit-modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 16px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-cancel, .btn-save {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
}

.btn-cancel {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  color: #333;
}

.btn-save {
  background-color: #42b983;
  border: none;
  color: white;
}

.btn-cancel:hover {
  background-color: #e9e9e9;
}

.btn-save:hover {
  background-color: #3aa876;
}

@media (max-width: 768px) {
  .set-selector {
    flex-direction: column;
  }
  
  .flashcard {
    height: 250px;
  }
}
</style>