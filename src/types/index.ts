/**
 * Represents a single flashcard with question and answer
 */
export interface Flashcard {
  /** Unique identifier for the flashcard */
  id: string;
  
  /** The question text */
  question: string;
  
  /** The answer text */
  answer: string;
  
  /** When the flashcard was created */
  createdAt: Date;
}

/**
 * Represents a set of flashcards generated from a document
 */
export interface FlashcardSet {
  /** Unique identifier for the set */
  id: string;
  
  /** Name of the flashcard set (usually derived from filename) */
  name: string;
  
  /** The flashcards in this set */
  cards: Flashcard[];
  
  /** When the set was created */
  createdAt: Date;
}

/**
 * Response status for API operations
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  loading: boolean;
}