# Flashcard From Document

A static web application that allows users to upload documents and create flashcards using Anthropic's Claude API.

## Features

- Upload TXT, MD, and PDF documents
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

The application is automatically deployed to GitHub Pages when application changes are pushed to the main branch. Documentation-only changes are ignored by the workflow. Check the workflow status after pushing:

```bash
gh run list
```

For details on GitHub Pages setup, the repository must have:

1. GitHub Pages enabled in repository Settings > Pages
   - Source should be set to "GitHub Actions"

2. The `.github/workflows/static.yml` file configured for the Vite app
    - This handles building and deploying the application
    - The `base` in `vite.config.ts` is set to include the repository name

The application will be available at: `https://{username}.github.io/{repository-name}/`

## How to Use

1. Enter your Claude API key in the input box and click "Save Key"
2. Upload a document by dragging and dropping or selecting a file
   - Currently supports .txt, .md, and .pdf files
3. Click "Generate Flashcards" to process the document
4. Your flashcards will appear in the Flashcard Display section
5. Click on a flashcard to flip between question and answer
6. Navigate between cards using the arrow buttons
7. Switch between different flashcard sets using the set selector

## Project Structure

- `/public` - Static assets
- `/research` - Research and exploratory code related to document processing
- `/scripts` - Project scripts such as version metadata generation
- `vite.config.ts` - Vite bundler configuration
- `/src`
  - `/assets` - Application assets
  - `/composables` - Reusable Vue Composition API logic
    - `useApiKey.ts` - API key management and validation
    - `useDocumentUpload.ts` - Document processing and text extraction
    - `useFlashcardGeneration.ts` - Claude flashcard generation orchestration
    - `useFlashcards.ts` - Flashcard set management and navigation
    - `useLocalStorage.ts` - Reactive localStorage integration
    - `useVersion.ts` - Version metadata loading for the UI footer
  - `/features` - UI components organized by feature
    - `api-key/ApiKeyInput.vue` - Component for entering and updating the Claude API key
    - `document-upload/DocumentUploader.vue` - Component for uploading TXT, MD, and PDF documents
    - `flashcard-display/FlashcardDisplay.vue` - Component for displaying and navigating flashcards
  - `/services` - API and service layer
    - `claude.ts` - Claude API integration
  - `/stores` - State management with Pinia
    - `flashcards.ts` - Storage for API key and flashcard sets
  - `/types` - TypeScript types
- `/tests` - Playwright tests
  - `app.spec.ts` - Core application end-to-end tests
  - `pdf-support.spec.ts` - PDF upload and generation tests

## API Considerations

- The application uses Anthropic's Claude API directly from the browser
- Users must provide their own API key (stored securely in localStorage)
- Basic rate limiting and error handling is implemented

## License

[MIT](LICENSE)
