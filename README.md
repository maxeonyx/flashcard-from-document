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

## Project Structure

- `/public` - Static assets
- `/src`
  - `/components` - UI components
  - `/services` - API and service layer
  - `/stores` - State management with Pinia
  - `/types` - TypeScript types
  - `/utils` - Helper functions
- `/tests` - Playwright tests

## API Considerations

- The application uses Anthropic's Claude API directly from the browser
- Users must provide their own API key (stored securely in localStorage)
- Basic rate limiting and error handling is implemented

## License

[MIT](LICENSE)
