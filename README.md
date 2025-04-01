# Flashcard From Document

A static web application that allows users to upload documents and create flashcards using Anthropic's Claude API.

## Features

- Upload documents and extract key concepts
- Generate flashcards using Claude AI
- Save flashcard sets locally
- Manage your flashcard collections
- Secure API key handling via localStorage

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Type checking
npm run typecheck

# Linting
npm run lint

# Build for production
npm run build
```

## Deployment

The application is automatically deployed to GitHub Pages when changes are pushed to the main branch. Check the workflow status after pushing:

```bash
gh run list
```

For details on GitHub Pages setup, the repository must have:

1. GitHub Pages enabled in repository Settings > Pages
   - Source should be set to "GitHub Actions"

2. The `.github/workflows/static.yml` file configured for Vue.js
   - This handles building and deploying the application
   - The `publicPath` in `vue.config.js` is set to include the repository name

The application will be available at: `https://{username}.github.io/{repository-name}/`

## How to Use

1. Enter your Claude API key in the input box and click "Save Key"
2. Upload a document by dragging and dropping or selecting a file
   - Currently supports .txt and .md files
3. Click "Generate Flashcards" to process the document
4. Your flashcards will appear in the Flashcard Display section
5. Click on a flashcard to flip between question and answer
6. Navigate between cards using the arrow buttons
7. Switch between different flashcard sets using the set selector

## Project Structure

- `/public` - Static assets
- `/src`
  - `/components` - UI components
    - `ApiKeyInput.vue` - Component for entering the Claude API key
    - `DocumentUploader.vue` - Component for uploading and processing documents
    - `FlashcardDisplay.vue` - Component for displaying and navigating flashcards
  - `/services` - API and service layer
    - `claude.ts` - Claude API integration
  - `/stores` - State management with Pinia
    - `flashcards.ts` - Storage for API key and flashcard sets
  - `/types` - TypeScript types
- `/tests` - Playwright tests

## API Considerations

- The application uses Anthropic's Claude API directly from the browser
- Users must provide their own API key (stored securely in localStorage)
- Basic rate limiting and error handling is implemented

## License

[MIT](LICENSE)
