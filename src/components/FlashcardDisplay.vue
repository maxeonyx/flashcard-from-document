<template>
  <div class="flashcard-display">
    <div v-if="!flashcardSets.length" class="no-flashcards">
      <h2>No Flashcard Sets</h2>
      <p>Upload a document to generate flashcards</p>
    </div>
    
    <div v-else>
      <h2>Your Flashcard Sets</h2>
      
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
          <button @click.stop="deleteSet(set.id)" class="delete-btn" title="Delete this set">
            ✕
          </button>
        </div>
      </div>
      
      <div v-if="selectedSet" class="flashcard-viewer">
        <h3>{{ selectedSet.name }}</h3>
        
        <div class="flashcard-navigation">
          <button 
            @click="prevCard" 
            class="nav-btn" 
            :disabled="currentCardIndex === 0"
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
          >
            →
          </button>
        </div>
        
        <div class="flashcard" @click="flipCard">
          <div class="card-content" :class="{ flipped: isFlipped }">
            <div class="card-front">
              <p>{{ currentCard.question }}</p>
            </div>
            <div class="card-back">
              <p>{{ currentCard.answer }}</p>
            </div>
          </div>
          <p class="flip-instruction">Click to flip</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch } from 'vue';
import { useFlashcardStore } from '../stores/flashcards.js';

export default defineComponent({
  name: 'FlashcardDisplay',
  props: {
    initialSetId: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const store = useFlashcardStore();
    const selectedSetId = ref(props.initialSetId);
    const currentCardIndex = ref(0);
    const isFlipped = ref(false);
    
    // Get all flashcard sets from the store
    const flashcardSets = computed(() => store.flashcardSets);
    
    // Get the currently selected set
    const selectedSet = computed(() => {
      if (!selectedSetId.value) return null;
      return flashcardSets.value.find(set => set.id === selectedSetId.value) || null;
    });
    
    // Get the current card
    const currentCard = computed(() => {
      if (!selectedSet.value) return { question: '', answer: '', id: '', createdAt: new Date() };
      return selectedSet.value.cards[currentCardIndex.value];
    });
    
    // Select a set
    function selectSet(id) {
      selectedSetId.value = id;
      currentCardIndex.value = 0;
      isFlipped.value = false;
    }
    
    // Delete a set
    function deleteSet(id) {
      if (confirm('Are you sure you want to delete this flashcard set?')) {
        store.deleteFlashcardSet(id);
        
        if (selectedSetId.value === id) {
          selectedSetId.value = flashcardSets.value.length > 0 ? flashcardSets.value[0].id : '';
          currentCardIndex.value = 0;
          isFlipped.value = false;
        }
      }
    }
    
    // Navigate to previous card
    function prevCard() {
      if (currentCardIndex.value > 0) {
        currentCardIndex.value--;
        isFlipped.value = false;
      }
    }
    
    // Navigate to next card
    function nextCard() {
      if (selectedSet.value && currentCardIndex.value < selectedSet.value.cards.length - 1) {
        currentCardIndex.value++;
        isFlipped.value = false;
      }
    }
    
    // Flip the current card
    function flipCard() {
      isFlipped.value = !isFlipped.value;
    }
    
    // Format date for display
    function formatDate(date) {
      const d = new Date(date);
      return d.toLocaleDateString();
    }
    
    // Watch for changes in flashcardSets
    watch(flashcardSets, (newSets) => {
      // If there are sets but none is selected, select the first one
      if (newSets.length > 0 && !selectedSetId.value) {
        selectedSetId.value = newSets[0].id;
      }
      
      // If the selected set was deleted, select the first available set
      if (selectedSetId.value && !newSets.find(set => set.id === selectedSetId.value)) {
        selectedSetId.value = newSets.length > 0 ? newSets[0].id : '';
        currentCardIndex.value = 0;
      }
    });
    
    // Watch for initialSetId changes
    watch(() => props.initialSetId, (newId) => {
      if (newId && flashcardSets.value.find(set => set.id === newId)) {
        selectSet(newId);
      }
    });
    
    return {
      flashcardSets,
      selectedSetId,
      selectedSet,
      currentCardIndex,
      currentCard,
      isFlipped,
      selectSet,
      deleteSet,
      prevCard,
      nextCard,
      flipCard,
      formatDate
    };
  }
});
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
  align-items: center;
  justify-content: center;
  padding: 20px;
  border-radius: 10px;
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
}

.flip-instruction {
  font-size: 13px;
  color: #999;
  margin-top: 10px;
}
</style>