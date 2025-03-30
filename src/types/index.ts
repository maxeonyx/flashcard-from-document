export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  createdAt: Date;
}

export interface FlashcardSet {
  id: string;
  name: string;
  cards: Flashcard[];
  createdAt: Date;
}