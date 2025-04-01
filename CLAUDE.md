# CLAUDE.md - Project Guidelines

## Project Overview
Flashcard From Document - A static web app that allows users to upload documents and create flashcards using Anthropic's Claude API. The application is designed to be simple, efficient, and user-friendly, with all processing happening client-side for maximum privacy.

## Current Features
- Document upload and text extraction (.txt, .md, .pdf formats)
- Intelligent flashcard generation via Claude API
- Automatic titling of flashcard sets based on content
- Well-formatted flashcard answers with proper line breaks
- Local storage for API keys and flashcard sets (no server-side storage)
- Multiple flashcard set management
- Interactive flashcard interface with flip animation
- Responsive design for all device types
- Dark/light mode support through system preferences

## Planned Features

### Functionality Enhancements
- Support for more document formats (docx, epub, etc.)
- Customizable flashcard templates
- Spaced repetition learning system
- Exportable flashcards (Anki, CSV)
- Categorization and tagging of flashcard sets
- Shareable flashcard sets via URL (no server storage)

### Technical Improvements
- Update to modern ESLint flat configuration
- Performance optimizations for larger flashcard sets
- Upgrade to latest Vite and Vue versions

## Development Philosophy

1. **Simplicity First**: Create a clean, functional, and minimal app that does one thing exceptionally well.
2. **Quality Over Features**: Prioritize code quality and user experience over feature quantity.
3. **Iterative Improvement**: Continuously improve existing code with small, well-tested changes.
4. **Privacy by Design**: Keep user data local and respect privacy by avoiding server-side processing.
5. **Accessibility**: Ensure the application is usable by people with diverse abilities and preferences.
6. **AI-Assisted Development**: Leverage Claude for code development, testing, and improvement.

## Development Process (STRICT REQUIREMENTS)

1. **Feature Development**
   - Implement the feature in the simplest and cleanest way.
   - Implement a simple and clean test.
   - ALWAYS remove old code if it is no longer required.

2. **Testing Requirements**
   - ALL code changes MUST have corresponding tests
   - Run the full test suite with `npm run test` prior to every commit
   - Tests MUST pass before any commit

3. **Pre-Commit Checklist**
   BEFORE git commit, always do ALL of the following:
   
   - Review added & related code, and make any improvements before committing. A small codebase is a good codebase.
   - `npm run typecheck && npm run lint && npm run test`
   - Update version in package.json (increment according to semver)
     - Major: Breaking changes
     - Minor: New features
     - Patch: Bug fixes
   - Display version is shown to users, so this is REQUIRED
   - Summarize the changed files and tests written to the user
   - Ask the user whether there is more to do, to commit and continue development, or commit and push/deploy

   There are no commit message requirements.

5. **Deployment Process**
   The app is deployed via GitHub workflows to GitHub pages. When deploying,
   always do ALL of the following.

   - `git push`
   - `sleep 5 && gh run list | head -5`
   - If any more waiting is required, link the user to https://github.com/maxeonyx/flashcard-from-document/actions/workflows/static.yml
   - If failed check logs for the given run(s): `sleep 5 && gh run view <run-id> --log-failed`
   - Verify https://maxeonyx.github.io/flashcard-from-document/ with WebFetchTool
   - If successful, link the user to the working application.
   
6. **Deployment Configuration**
   - `static.yml` - GitHub's standard Pages workflow (configured for our Vue.js app)
   - GitHub Pages must be enabled in repository Settings > Pages
     - Source should be set to "GitHub Actions"

## Tech Stack

### Frontend
- Vue.js 3 with Composition API
- TypeScript 5.8+
- Pinia for state management
- Modern CSS with flexbox/grid layouts and transitions

### API & Processing
- Anthropic Claude API via @anthropic-ai/sdk
- Browser File API for document handling
- LocalStorage for client-side persistence

### Development & Deployment
- Vite build system
- ESLint for code quality
- Playwright for end-to-end testing
- GitHub Actions for CI/CD
- GitHub Pages for hosting

## Development Commands

### Project Commands
- `npm run dev` - Start development server (Vite)
- `npm run build` - Build production-ready assets
- `npm run preview` - Preview production build locally
- `npm run type-check` - Check TypeScript types
- `npm run typecheck` - Alternative TypeScript check (for compatibility)
- `npm run lint` - Run ESLint code quality checks
- `npm run test` - Run Playwright end-to-end tests

### Deployment Monitoring Commands
- `gh run list` - Check GitHub Actions workflow status
- `gh run view <run-id>` - View summary of a specific workflow run
- `gh run view <run-id> --log` - View complete logs of a workflow run
- `gh run view <run-id> --log-failed` - View only the failed steps in a workflow run
- `gh run rerun <run-id>` - Rerun a failed workflow

## API Implementation
- Using Anthropic API directly from browser with Claude 3.5 Sonnet model
- Secure API key handling in localStorage (never stored on server)
- Prompt engineering for structured JSON output with title and flashcards
- Robust JSON parsing with multiple fallback strategies
- Comprehensive error handling and user feedback
- Client-side model validation and content preprocessing

## Project Architecture

The project follows a feature-based architecture with composables for reusable logic:

### Core Organization
- `.github/workflows/static.yml` - GitHub workflow for Pages deployment
- `package.json` - Project dependencies and scripts
- `src/main.ts` - Application entry point
- `src/App.vue` - Root Vue component

### Configuration Files
- `.eslintrc.cjs` - ESLint configuration (CommonJS format for compatibility)
- `tsconfig.json` - TypeScript project configuration
- `tsconfig.app.json` - TypeScript configuration for the Vue application
- `tsconfig.node.json` - TypeScript configuration for Node.js environment
- `vite.config.ts` - Vite bundler configuration
- `playwright.config.ts` - End-to-end testing configuration
- `env.d.ts` - TypeScript declarations for Vite environment

> **Note:** The project has been migrated from Vue CLI to Vite.
> ESLint is currently using the `.eslintrc.cjs` format, but a future update
> may migrate to the newer flat configuration format.

### Feature Components
- `src/features/` - UI components organized by feature
  - `api-key/ApiKeyInput.vue` - API key management component
  - `document-upload/DocumentUploader.vue` - Document upload and processing component
  - `flashcard-display/FlashcardDisplay.vue` - Flashcard display and navigation component

### Logic & State Management
- `src/composables/` - Reusable hooks following the Vue Composition API pattern
  - `useApiKey.ts` - API key management and validation
  - `useDocumentUpload.ts` - Document processing and text extraction
  - `useFlashcardGeneration.ts` - Claude flashcard generation orchestration
  - `useFlashcards.ts` - Flashcard set management and navigation
  - `useLocalStorage.ts` - Reactive localStorage integration

### Services & Types
- `src/services/claude.ts` - Claude API integration and JSON parsing
- `src/types/index.ts` - TypeScript interface definitions
- `src/stores/flashcards.ts` - Pinia store for flashcard state management

### Testing
- `tests/app.spec.ts` - Playwright end-to-end tests
- `playwright.config.ts` - Test configuration

## Version History

Always update both this file `CLAUDE.md` AND `package.json`.

- 0.4.0 - Migrated build system from Vue CLI to Vite
- 0.3.8 - Enhanced pre-commit process with user interaction and decision points
- 0.3.7 - Updated project documentation with features, architecture, and roadmap
- 0.3.6 - Fixed flashcard display issues with answer formatting and automatic selection
- 0.3.5 - Added automatic title generation for flashcard sets
- 0.3.4 - Fixed JSON parsing of Claude API responses to correctly handle direct JSON output
- 0.3.3 - Updated Claude model to claude-3-5-sonnet-20241022 to fix API compatibility issue
- 0.3.2 - Fixed JSON parsing from Claude responses and improved prompt for better flashcard generation
- 0.3.1 - Fixed Anthropic API browser compatibility by adding dangerouslyAllowBrowser option
- 0.3.0 - Major refactoring: Reorganized project structure with feature-based folders, added composables, improved loading states, and accessibility
- 0.2.2 - Fixed ESLint dependencies for GitHub Pages deployment
- 0.2.1 - Converted application to TypeScript and modernized Vue components
- 0.2.0 - Implemented core flashcard generation functionality
- 0.1.5 - Updated GitHub Pages static workflow with build and test steps
- 0.1.4 - Added GitHub Pages configuration requirements to documentation
- 0.1.3 - Added Playwright browser installation to CI/CD workflow
- 0.1.2 - Fixed GitHub Actions workflow and added detailed deployment monitoring instructions
- 0.1.1 - Updated CLAUDE.md with detailed development process and file structure
- 0.1.0 - Initial project setup with Vue.js, TypeScript, and testing