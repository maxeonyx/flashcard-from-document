// Types defined here for documentation purposes
// These aren't used at runtime since we're using standard JavaScript
/**
 * @typedef {Object} Flashcard
 * @property {string} id - Unique identifier for the flashcard
 * @property {string} question - The question side of the flashcard
 * @property {string} answer - The answer side of the flashcard
 * @property {Date} createdAt - When the flashcard was created
 */

/**
 * @typedef {Object} FlashcardSet
 * @property {string} id - Unique identifier for the set
 * @property {string} name - The name of the flashcard set
 * @property {Array<Flashcard>} cards - The flashcards in this set
 * @property {Date} createdAt - When the set was created
 */