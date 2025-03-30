# CLAUDE.md - Project Guidelines

## Project Overview
Flashcard From Document - A static web app that allows users to upload documents and create flashcards using Claude API.

## Core Features
- Document upload
- Flashcard generation via Claude API
- Local storage for API keys and flashcard sets
- Responsive design

## Development Process
- Use headless browser testing (Playwright)
- Version updates on test passes
- Frequent commits for granular undo capability
- Pushes correspond to deployments

## Commands
- `npm run dev` - Start development server
- `npm run test` - Run headless browser tests
- `npm run build` - Build production version
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Deployment
- GitHub Actions workflow updates gh-pages branch
- Check workflow status after each push with `gh run list`

## Commit Guidelines
- Descriptive, present-tense messages
- Include relevant feature/component references
- Auto-update version on test passes

## API Considerations
- Use Anthropic API directly from browser
- Secure API key handling in localStorage
- Implement rate limiting and error handling

## File Organization
```
/
├── public/            # Static assets
├── src/
│   ├── components/    # UI components
│   ├── services/      # API and service layer
│   ├── stores/        # State management
│   ├── types/         # TypeScript types
│   └── utils/         # Helper functions
├── tests/             # Playwright tests
└── ...                # Config files
```